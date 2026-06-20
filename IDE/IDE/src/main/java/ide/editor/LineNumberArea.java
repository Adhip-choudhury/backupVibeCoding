package ide.editor;

import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

public class LineNumberArea extends Canvas {

    private static final Color BG_COLOR = Color.web("#252526");
    private static final Color TEXT_COLOR = Color.web("#858585");
    private static final Color CARET_LINE_COLOR = Color.web("#d4d4d4");

    private final CodeEditor editor;
    private double currentHeight = 0;

    public LineNumberArea(CodeEditor editor) {
        this.editor = editor;
    }

    @Override
    public void resize(double w, double h) {
        super.resize(w, h);
        if (w > 0 && h > 0) {
            setWidth(w);
            setHeight(h);
            currentHeight = h;
        }
    }

    public void redraw() {
        double h = currentHeight > 0 ? currentHeight : getHeight();
        if (h <= 0) return;

        GraphicsContext gc = getGraphicsContext2D();
        gc.clearRect(0, 0, getWidth(), h);

        gc.setFill(BG_COLOR);
        gc.fillRect(0, 0, getWidth(), h);

        DocumentModel doc = editor.getDocument();
        int scrollOffset = editor.getScrollOffsetY();
        double lineHeight = editor.getLineHeight();
        int visibleLines = (int) (h / lineHeight) + 2;

        for (int i = 0; i < visibleLines; i++) {
            int lineNumber = scrollOffset + i;
            if (lineNumber >= doc.getLineCount()) break;

            double y = i * lineHeight + 2;

            if (lineNumber == editor.getCaretLine()) {
                gc.setFill(CARET_LINE_COLOR);
                gc.setFont(Font.font("Consolas", 13));
            } else {
                gc.setFill(TEXT_COLOR);
                gc.setFont(Font.font("Consolas", 12));
            }

            gc.fillText(String.valueOf(lineNumber + 1), getWidth() - 10, y);
        }
    }

    @Override
    public boolean isResizable() { return true; }
}
