import cv2
import mediapipe as mp
import numpy as np
import math

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
             379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
             234, 127, 162, 21, 54, 103, 67, 109, 10]

LEFT_EYE  = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

LEFT_BROW  = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107]
RIGHT_BROW = [276, 283, 282, 295, 285, 300, 293, 334, 296, 336]

NOSE = [
    168, 6, 197, 195, 5, 4,
    1, 2, 98, 97, 48, 49,
    462, 420, 358, 429, 279,
    278, 326, 327, 289, 19
]

LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
LIPS_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]

LEFT_IRIS_IDX = 468
RIGHT_IRIS_IDX = 473

FACIAL_FEATURES = {
    "Face":        (FACE_OVAL,                      (0, 255, 0)),
    "Left Brow":   (LEFT_BROW,                      (255, 255, 0)),
    "Right Brow":  (RIGHT_BROW,                     (255, 255, 0)),
    "Left Eye":    (LEFT_EYE,                       (255, 0, 0)),
    "Right Eye":   (RIGHT_EYE,                      (255, 0, 0)),
    "Nose":        (NOSE,                            (0, 165, 255)),
    "Lips":        (LIPS_OUTER + LIPS_INNER,        (255, 0, 255)),
}

smooth_gaze_x = 0.0
smooth_gaze_y = 0.0

def draw_filled_feature_hull(overlay, landmarks_list, indices, color, w, h):
    pts = []
    for i in indices:
        lm = landmarks_list[i]
        pts.append((int(lm.x * w), int(lm.y * h)))
    pts = np.array(pts, dtype=np.int32)
    hull = cv2.convexHull(pts)
    cv2.fillPoly(overlay, [hull], color=color)

def draw_filled_feature(overlay, landmarks_list, indices, color, w, h):
    pts = []
    for i in indices:
        lm = landmarks_list[i]
        pts.append((int(lm.x * w), int(lm.y * h)))
    pts = np.array(pts, dtype=np.int32)
    cv2.fillPoly(overlay, [pts], color=color)

def draw_outline_and_label(frame, landmarks_list, indices, color, label, w, h):
    pts = []
    for i in indices:
        lm = landmarks_list[i]
        pts.append((int(lm.x * w), int(lm.y * h)))
    pts = np.array(pts, dtype=np.int32)
    cv2.polylines(frame, [pts], isClosed=True, color=color, thickness=2)
    cx, cy = int(np.mean(pts[:, 0])), int(np.mean(pts[:, 1]))
    cv2.putText(frame, label, (cx - 30, cy - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)

def get_eye_bbox(landmarks, eye_indices, w, h):
    xs, ys = [], []
    for idx in eye_indices:
        lm = landmarks[idx]
        xs.append(lm.x * w)
        ys.append(lm.y * h)
    ex_min, ex_max = min(xs), max(xs)
    ey_min, ey_max = min(ys), max(ys)
    return ex_min, ey_min, ex_max, ey_max

def compute_gaze(landmarks, eye_indices, iris_idx, w, h):
    try:
        iris = landmarks[iris_idx]
    except IndexError:
        return None, None

    iris_pt = np.array([iris.x * w, iris.y * h])
    ex_min, ey_min, ex_max, ey_max = get_eye_bbox(landmarks, eye_indices, w, h)
    eye_cx = (ex_min + ex_max) / 2
    eye_cy = (ey_min + ey_max) / 2
    eye_w = ex_max - ex_min
    eye_h = ey_max - ey_min

    if eye_w < 5 or eye_h < 5:
        return None, None

    gaze_x = (iris_pt[0] - eye_cx) / (eye_w / 2)
    gaze_y = (iris_pt[1] - eye_cy) / (eye_h / 2)
    return gaze_x, gaze_y

def draw_gaze_arrow(frame, landmarks, eye_indices, iris_idx, color, w, h):
    eye_pts = []
    for idx in eye_indices:
        lm = landmarks[idx]
        eye_pts.append((lm.x * w, lm.y * h))
    eye_center = np.mean(eye_pts, axis=0)

    try:
        iris = landmarks[iris_idx]
        iris_pt = np.array([iris.x * w, iris.y * h])
    except IndexError:
        return

    dx = iris_pt[0] - eye_center[0]
    dy = iris_pt[1] - eye_center[1]

    length = math.sqrt(dx**2 + dy**2)
    if length < 2:
        return

    scale = min(length * 3, 60)
    dx = dx / length * scale
    dy = dy / length * scale

    start = (int(eye_center[0]), int(eye_center[1]))
    end = (int(eye_center[0] + dx), int(eye_center[1] + dy))

    cv2.arrowedLine(frame, start, end, color, 2, tipLength=0.3)

def draw_status_banner(frame, status, color):
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (frame.shape[1], 80), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    cv2.putText(frame, status, (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

    cv2.putText(frame, "Gaze X: {:+.2f}  Gaze Y: {:+.2f}".format(smooth_gaze_x, smooth_gaze_y),
                (30, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="face_landmarker_v2_with_blendshapes.task"),
    running_mode=VisionRunningMode.IMAGE,
    num_faces=1,
    output_face_blendshapes=False,
    output_facial_transformation_matrixes=False,
    min_face_detection_confidence=0.5,
)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam")
    exit()

print("Press 'q' to quit")

with FaceLandmarker.create_from_options(options) as landmarker:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h_frm, w_frm = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = landmarker.detect(mp_image)

        if result.face_landmarks:
            landmarks = result.face_landmarks[0]
            h, w = frame.shape[:2]

            overlay = np.zeros((h, w, 3), dtype=np.uint8)

            for label, (indices, color) in FACIAL_FEATURES.items():
                if label == "Nose":
                    draw_filled_feature_hull(overlay, landmarks, indices, color, w, h)
                else:
                    draw_filled_feature(overlay, landmarks, indices, color, w, h)

            frame = cv2.addWeighted(overlay, 0.25, frame, 0.75, 0)

            for label, (indices, color) in FACIAL_FEATURES.items():
                draw_outline_and_label(frame, landmarks, indices, color, label, w, h)

            draw_gaze_arrow(frame, landmarks, LEFT_EYE, LEFT_IRIS_IDX, (255, 255, 255), w, h)
            draw_gaze_arrow(frame, landmarks, RIGHT_EYE, RIGHT_IRIS_IDX, (255, 255, 255), w, h)

            gx1, gy1 = compute_gaze(landmarks, LEFT_EYE, LEFT_IRIS_IDX, w, h)
            gx2, gy2 = compute_gaze(landmarks, RIGHT_EYE, RIGHT_IRIS_IDX, w, h)

            if gx1 is not None and gx2 is not None:
                raw_gx = (gx1 + gx2) / 2
                raw_gy = (gy1 + gy2) / 2
            elif gx1 is not None:
                raw_gx, raw_gy = gx1, gy1
            elif gx2 is not None:
                raw_gx, raw_gy = gx2, gy2
            else:
                raw_gx, raw_gy = 0, 0

            smooth_gaze_x = smooth_gaze_x * 0.8 + raw_gx * 0.2
            smooth_gaze_y = smooth_gaze_y * 0.8 + raw_gy * 0.2

            gx, gy = smooth_gaze_x, smooth_gaze_y

            if abs(gx) > 0.28 or abs(gy) > 0.35:
                status = "CHEATING DETECTED - Looking away!"
                color = (0, 0, 255)
            else:
                status = "Looking Straight - OK"
                color = (0, 255, 0)

            draw_status_banner(frame, status, color)
        else:
            smooth_gaze_x = 0
            smooth_gaze_y = 0
            status = "Not Looking - No face detected"
            draw_status_banner(frame, status, (0, 0, 255))

        cv2.imshow("Face Cheat Detection", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()
