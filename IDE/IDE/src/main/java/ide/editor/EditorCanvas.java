package ide.editor;

import javafx.geometry.VPos;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

public class EditorCanvas extends Canvas {

    private static final Color BG_COLOR = Color.web("#1e1e1e");
    private static final Color TEXT_COLOR = Color.web("#d4d4d4");
    private static final Color CARET_COLOR = Color.web("#ffffff");
    private static final Color SELECTION_COLOR = Color.web("#264f78");
    private static final Color LINE_HIGHLIGHT_COLOR = Color.web("#2a2d2e");

    private final CodeEditor editor;

    public EditorCanvas(CodeEditor editor) {
        this.editor = editor;
    }

    @Override
    public void resize(double w, double h) {
        super.resize(w, h);
        if (w > 0 && h > 0) {
            setWidth(w);
            setHeight(h);
        }
    }

    public void redraw() {
        double w = getWidth();
        double h = getHeight();
        if (w <= 0 || h <= 0) return;

        GraphicsContext gc = getGraphicsContext2D();
        gc.clearRect(0, 0, w, h);

        gc.setFill(BG_COLOR);
        gc.fillRect(0, 0, w, h);

        gc.setFont(editor.getFont());
        gc.setTextBaseline(VPos.TOP);

        DocumentModel doc = editor.getDocument();
        int scrollY = editor.getScrollOffsetY();
        int scrollX = editor.getScrollOffsetX();
        double lh = editor.getLineHeight();
        double cw = editor.getCharWidth();
        int visibleLines = (int) (h / lh) + 2;
        int caretLine = editor.getCaretLine();

        gc.setFill(LINE_HIGHLIGHT_COLOR);
        gc.fillRect(0, (caretLine - scrollY) * lh, w, lh);

        for (int i = 0; i < visibleLines; i++) {
            int lineIdx = scrollY + i;
            if (lineIdx >= doc.getLineCount()) break;

            String text = doc.getLine(lineIdx);
            double y = i * lh;

            drawSelection(gc, text, lineIdx, scrollY, scrollX, w, lh, cw);

            SyntaxHighlighter.Result highlight = editor.getHighlighter().highlight(text);
            for (SyntaxHighlighter.Token token : highlight.getTokens()) {
                gc.setFill(token.color());
                int start = Math.max(0, token.start() - scrollX);
                int end = Math.max(start, token.end() - scrollX);
                if (start > text.length()) break;
                gc.fillText(
                    text.substring(token.start(), Math.min(token.end(), text.length())),
                    start * cw, y
                );
            }

            if (lineIdx == caretLine) {
                gc.setFill(CARET_COLOR);
                gc.fillRect((editor.getCaretColumn() - scrollX) * cw, y, 2, lh);
            }
        }
    }

    private void drawSelection(GraphicsContext gc, String text, int lineIdx,
                                int scrollY, int scrollX, double w, double lh, double cw) {
        int[] selStart = editor.getSelectionStart();
        if (selStart == null) return;

        int selEndLine = editor.getCaretLine();
        int selEndCol = editor.getCaretColumn();
        int selStartLine = selStart[0];
        int selStartCol = selStart[1];

        if (selStartLine > selEndLine || (selStartLine == selEndLine && selStartCol > selEndCol)) {
            int tl = selStartLine, tc = selStartCol;
            selStartLine = selEndLine; selStartCol = selEndCol;
            selEndLine = tl; selEndCol = tc;
        }

        if (lineIdx < selStartLine || lineIdx > selEndLine) return;

        gc.setFill(SELECTION_COLOR);
        if (lineIdx == selStartLine && lineIdx == selEndLine) {
            double sx = (selStartCol - scrollX) * cw;
            double ex = (selEndCol - scrollX) * cw;
            gc.fillRect(sx, (lineIdx - scrollY) * lh, ex - sx, lh);
        } else if (lineIdx == selStartLine) {
            double sx = (selStartCol - scrollX) * cw;
            gc.fillRect(sx, (lineIdx - scrollY) * lh, w - sx, lh);
        } else if (lineIdx == selEndLine) {
            double ex = (selEndCol - scrollX) * cw;
            gc.fillRect(0, (lineIdx - scrollY) * lh, ex, lh);
        } else {
            gc.fillRect(0, (lineIdx - scrollY) * lh, w, lh);
        }
    }

    @Override
    public boolean isResizable() { return true; }
}
