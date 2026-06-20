import cv2
import numpy as np
from dataclasses import dataclass, field


@dataclass
class Stroke:
    color: tuple
    thickness: int
    points: list = field(default_factory=list)


@dataclass
class Palette:
    colors: list = field(default_factory=lambda: [
        (255, 255, 255), (0, 0, 255), (0, 255, 0),
        (255, 0, 0), (0, 255, 255), (255, 0, 255),
    ])
    names: list = field(default_factory=lambda: [
        "WHITE", "RED", "GREEN", "BLUE", "YELLOW", "PINK",
    ])
    selected: int = 0

    @property
    def color(self):
        return self.colors[self.selected]

    def draw(self, frame, y_start, box_size=40, gap=8):
        h, w = frame.shape[:2]
        total_w = len(self.colors) * (box_size + gap) - gap
        x_start = (w - total_w) // 2
        for i, (col, name) in enumerate(zip(self.colors, self.names)):
            x = x_start + i * (box_size + gap)
            cv2.rectangle(frame, (x, y_start), (x + box_size, y_start + box_size), col, -1)
            if i == self.selected:
                cv2.rectangle(frame, (x - 2, y_start - 2),
                              (x + box_size + 2, y_start + box_size + 2), (255, 255, 255), 2)

    def hit_test(self, x, y, y_start, box_size=40, gap=8):
        total_w = len(self.colors) * (box_size + gap) - gap
        x_start = (1280 - total_w) // 2
        if not (y_start <= y <= y_start + box_size):
            return False
        for i in range(len(self.colors)):
            if x_start + i * (box_size + gap) <= x <= x_start + i * (box_size + gap) + box_size:
                self.selected = i
                return True
        return False


class HandDraw:
    def __init__(self, cam_id=0, width=1280, height=720):
        self.cap = cv2.VideoCapture(cam_id)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        if not self.cap.isOpened():
            raise RuntimeError("Cannot open webcam")

        self.w = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.h = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        self.canvas = np.zeros((self.h, self.w, 3), dtype=np.uint8)
        self.strokes = []
        self.current_stroke = None
        self.drawing = False
        self.palette = Palette()
        self.thickness = 4
        self.prev_pt = None
        self.fps = 0
        self.frame_count = 0
        self.fps_timer = cv2.getTickCount()

        # Skin detection in HSV
        self.lower_skin = np.array([0, 20, 70])
        self.upper_skin = np.array([20, 150, 255])
        self.kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))

        # Pinch detection
        self.pinch_cooldown = 0

    def _find_fingertip(self, hand_contour):
        if len(hand_contour) < 10:
            return None
        hull = cv2.convexHull(hand_contour, returnPoints=True)
        # highest point (smallest y) on convex hull is fingertip
        top = min(hull, key=lambda p: p[0][1])[0]
        return tuple(top)

    def _is_pinch(self, hand_contour, fingertip, frame):
        # sample region below fingertip to detect thumb near index
        x, y = fingertip
        roi = frame[max(0, y - 15):min(self.h, y + 15),
                    max(0, x - 30):min(self.w, x + 30)]
        if roi.size == 0:
            return False
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, self.lower_skin, self.upper_skin)
        skin_pct = cv2.countNonZero(mask) / mask.size
        # high skin coverage around tip -> likely pinching
        return skin_pct > 0.4

    def _draw_ui(self, frame):
        palette_y = self.h - 60
        self.palette.draw(frame, palette_y)
        status = "DRAW" if self.drawing else "HOVER"
        cv2.putText(frame, f"FPS:{self.fps} | {status}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        cv2.putText(frame, "C:clear  S:save  Q:quit", (self.w - 250, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)

    def run(self):
        print("=== Hand Draw (OpenCV skin tracking) ===")
        print("Pinch thumb+index to toggle drawing")
        print("C - Clear   S - Save   Q - Quit\n")

        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            skin = cv2.inRange(hsv, self.lower_skin, self.upper_skin)
            skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, self.kernel)
            skin = cv2.morphologyEx(skin, cv2.MORPH_CLOSE, self.kernel)

            contours, _ = cv2.findContours(skin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            hand_contour = None
            if contours:
                hand_contour = max(contours, key=cv2.contourArea)
                if cv2.contourArea(hand_contour) < 5000:
                    hand_contour = None

            fingertip = None
            if hand_contour is not None:
                fingertip = self._find_fingertip(hand_contour)
                cv2.drawContours(frame, [hand_contour], -1, (100, 200, 100), 1)

            if fingertip:
                cx, cy = fingertip
                pinching = self._is_pinch(hand_contour, fingertip, frame)

                if pinching and self.pinch_cooldown == 0:
                    palette_hit = self.palette.hit_test(cx, cy, self.h - 60)
                    if palette_hit:
                        self.drawing = False
                        self.current_stroke = None
                        self.prev_pt = None
                    else:
                        self.drawing = not self.drawing
                        if self.drawing:
                            self.current_stroke = Stroke(
                                color=self.palette.color,
                                thickness=self.thickness,
                                points=[fingertip],
                            )
                            self.strokes.append(self.current_stroke)
                        else:
                            self.current_stroke = None
                            self.prev_pt = None
                    self.pinch_cooldown = 15

                if self.pinch_cooldown > 0:
                    self.pinch_cooldown -= 1

                if self.drawing and self.current_stroke is not None:
                    self.current_stroke.points.append(fingertip)

                # fingertip cursor
                col = (0, 255, 0) if not self.drawing else (0, 0, 255)
                cv2.circle(frame, (cx, cy), 8, col, 2)
                cv2.circle(frame, (cx, cy), 3, col, -1)

            # render all strokes on canvas
            self.canvas[:] = 0
            for stroke in self.strokes:
                pts = np.array(stroke.points, dtype=np.int32)
                if len(pts) > 1:
                    cv2.polylines(self.canvas, [pts], False, stroke.color, stroke.thickness, cv2.LINE_AA)

            # composite canvas onto frame
            mask = np.any(self.canvas > 0, axis=2)
            frame[mask] = self.canvas[mask]

            self._draw_ui(frame)

            # FPS calculation (every 30 frames)
            self.frame_count += 1
            if self.frame_count >= 30:
                elapsed = (cv2.getTickCount() - self.fps_timer) / cv2.getTickFrequency()
                self.fps = int(self.frame_count / elapsed)
                self.frame_count = 0
                self.fps_timer = cv2.getTickCount()

            cv2.imshow("Hand Draw", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break
            elif key == ord("c"):
                self.strokes.clear()
                self.canvas[:] = 0
                self.current_stroke = None
                self.prev_pt = None
                print("Cleared")
            elif key == ord("s"):
                cv2.imwrite("hand_drawing.png", self.canvas)
                print("Saved hand_drawing.png")

        self.cap.release()
        cv2.destroyAllWindows()


def main():
    try:
        app = HandDraw()
        app.run()
    except RuntimeError as e:
        print(f"Error: {e}")
        return 1
    return 0


if __name__ == "__main__":
    exit(main())
