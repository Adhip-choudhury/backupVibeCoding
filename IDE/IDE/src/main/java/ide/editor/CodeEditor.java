package ide.editor;

import ide.core.NovaIDE;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.geometry.Orientation;
import javafx.scene.control.IndexRange;
import javafx.scene.control.ScrollBar;
import javafx.scene.input.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;

import java.util.Stack;

public class CodeEditor extends Region {

    private static final Font DEFAULT_FONT = Font.font("Consolas", 14);
    private static final double LINE_HEIGHT = 20;
    private static final double CHAR_WIDTH = 8.4;
    private static final double LINE_NUMBERS_WIDTH = 50;
    private static final double SCROLLBAR_SIZE = 16;

    private final DocumentModel document;
    private final EditorCanvas editorCanvas;
    private final LineNumberArea lineNumbers;
    private final ScrollBar verticalScroll;
    private final ScrollBar horizontalScroll;

    private int caretLine = 0;
    private int caretColumn = 0;
    private int selectionStartLine = -1;
    private int selectionStartCol = -1;
    private int scrollOffsetY = 0;
    private int scrollOffsetX = 0;

    private final SyntaxHighlighter highlighter;
    private final Stack<String> undoStack = new Stack<>();
    private final Stack<String> redoStack = new Stack<>();
    private final StringProperty filePath = new SimpleStringProperty();

    public CodeEditor() {
        document = new DocumentModel();
        highlighter = new SyntaxHighlighter();
        editorCanvas = new EditorCanvas(this);
        lineNumbers = new LineNumberArea(this);
        verticalScroll = new ScrollBar();
        horizontalScroll = new ScrollBar();

        verticalScroll.setOrientation(Orientation.VERTICAL);
        verticalScroll.valueProperty().addListener((obs, old, val) -> {
            scrollOffsetY = val.intValue();
            editorCanvas.redraw();
            lineNumbers.redraw();
        });

        horizontalScroll.setOrientation(Orientation.HORIZONTAL);
        horizontalScroll.valueProperty().addListener((obs, old, val) -> {
            scrollOffsetX = val.intValue();
            editorCanvas.redraw();
            lineNumbers.redraw();
        });

        editorCanvas.setOnScroll(e -> {
            double delta = e.getDeltaY();
            if (e.isShiftDown()) {
                horizontalScroll.setValue(horizontalScroll.getValue() - delta);
            } else {
                verticalScroll.setValue(verticalScroll.getValue() - delta);
            }
        });

        getChildren().addAll(lineNumbers, editorCanvas, verticalScroll, horizontalScroll);

        setOnKeyPressed(this::handleKeyPress);
        setOnMouseClicked(this::handleMouseClick);
        setOnMouseDragged(this::handleMouseDrag);

        setFocusTraversable(true);
        sceneProperty().addListener((obs, old, scene) -> {
            if (scene != null) requestFocus();
        });
    }

    @Override
    protected void layoutChildren() {
        double w = getWidth();
        double h = getHeight();
        if (w <= 0 || h <= 0) return;

        double cw = Math.max(0, w - LINE_NUMBERS_WIDTH - SCROLLBAR_SIZE);
        double ch = Math.max(0, h - SCROLLBAR_SIZE);

        lineNumbers.resizeRelocate(0, 0, LINE_NUMBERS_WIDTH, ch);
        editorCanvas.resizeRelocate(LINE_NUMBERS_WIDTH, 0, cw, ch);
        verticalScroll.resizeRelocate(w - SCROLLBAR_SIZE, 0, SCROLLBAR_SIZE, ch);
        horizontalScroll.resizeRelocate(0, h - SCROLLBAR_SIZE, w - SCROLLBAR_SIZE, SCROLLBAR_SIZE);

        syncScrollBounds();
        editorCanvas.redraw();
        lineNumbers.redraw();
    }

    private void syncScrollBounds() {
        int totalLines = document.getLineCount();
        double ch = getHeight() - SCROLLBAR_SIZE;
        int visibleLines = Math.max(1, (int) (ch / LINE_HEIGHT));
        verticalScroll.setMax(Math.max(0, totalLines - visibleLines));
        verticalScroll.setVisibleAmount(visibleLines);

        int maxLineWidth = 0;
        for (int i = 0; i < totalLines; i++) {
            maxLineWidth = Math.max(maxLineWidth, document.getLine(i).length());
        }
        double cw = getWidth() - LINE_NUMBERS_WIDTH - SCROLLBAR_SIZE;
        int visibleChars = Math.max(1, (int) (cw / CHAR_WIDTH));
        horizontalScroll.setMax(Math.max(0, maxLineWidth - visibleChars));
        horizontalScroll.setVisibleAmount(visibleChars);
    }

    public void setText(String text) {
        document.setText(text);
        caretLine = 0;
        caretColumn = 0;
        selectionStartLine = -1;
        selectionStartCol = -1;
        scrollOffsetY = 0;
        scrollOffsetX = 0;
        undoStack.clear();
        redoStack.clear();
        verticalScroll.setValue(0);
        horizontalScroll.setValue(0);
        if (getWidth() > 0 && getHeight() > 0) {
            syncScrollBounds();
            editorCanvas.redraw();
            lineNumbers.redraw();
        }
    }

    public String getText() { return document.getText(); }
    public StringProperty filePathProperty() { return filePath; }
    public DocumentModel getDocument() { return document; }
    public int getCaretLine() { return caretLine; }
    public int getCaretColumn() { return caretColumn; }
    public int getScrollOffsetY() { return scrollOffsetY; }
    public int getScrollOffsetX() { return scrollOffsetX; }
    public SyntaxHighlighter getHighlighter() { return highlighter; }
    public Font getFont() { return DEFAULT_FONT; }
    public double getLineHeight() { return LINE_HEIGHT; }
    public double getCharWidth() { return CHAR_WIDTH; }

    private void refresh() {
        if (getWidth() <= 0 || getHeight() <= 0) return;
        syncScrollBounds();
        editorCanvas.redraw();
        lineNumbers.redraw();
        updateStatusBar();
    }

    private double getEditAreaWidth() {
        return Math.max(0, getWidth() - LINE_NUMBERS_WIDTH - SCROLLBAR_SIZE);
    }

    private double getEditAreaHeight() {
        return Math.max(0, getHeight() - SCROLLBAR_SIZE);
    }

    private void handleKeyPress(KeyEvent e) {
        switch (e.getCode()) {
            case LEFT -> moveCaret(0, -1, e.isShiftDown());
            case RIGHT -> moveCaret(0, 1, e.isShiftDown());
            case UP -> moveCaret(-1, 0, e.isShiftDown());
            case DOWN -> moveCaret(1, 0, e.isShiftDown());
            case HOME -> {
                if (e.isControlDown()) moveCaret(-caretLine, -caretColumn, e.isShiftDown());
                else moveCaret(0, -caretColumn, e.isShiftDown());
            }
            case END -> {
                if (e.isControlDown()) {
                    int lastLine = document.getLineCount() - 1;
                    moveCaret(lastLine - caretLine, document.getLine(lastLine).length() - caretColumn, e.isShiftDown());
                } else {
                    moveCaret(0, document.getLine(caretLine).length() - caretColumn, e.isShiftDown());
                }
            }
            case PAGE_UP -> {
                int lines = Math.max(1, (int) (getEditAreaHeight() / LINE_HEIGHT));
                moveCaret(-lines, 0, e.isShiftDown());
                e.consume();
            }
            case PAGE_DOWN -> {
                int lines = Math.max(1, (int) (getEditAreaHeight() / LINE_HEIGHT));
                moveCaret(lines, 0, e.isShiftDown());
                e.consume();
            }
            case BACK_SPACE -> {
                saveUndo();
                if (hasSelection()) { deleteSelection(); }
                else if (caretColumn > 0) {
                    deleteCharAt(caretLine, caretColumn - 1);
                    caretColumn--;
                    refresh();
                } else if (caretLine > 0) {
                    String prev = document.getLine(caretLine - 1);
                    int join = prev.length();
                    document.setLine(caretLine - 1, prev + document.getLine(caretLine));
                    document.removeLine(caretLine);
                    caretLine--; caretColumn = join;
                    refresh();
                }
                e.consume();
            }
            case DELETE -> {
                saveUndo();
                if (hasSelection()) { deleteSelection(); }
                else {
                    String s = document.getLine(caretLine);
                    if (caretColumn < s.length()) {
                        deleteCharAt(caretLine, caretColumn);
                        refresh();
                    } else if (caretLine < document.getLineCount() - 1) {
                        document.setLine(caretLine, s + document.getLine(caretLine + 1));
                        document.removeLine(caretLine + 1);
                        refresh();
                    }
                }
                e.consume();
            }
            case ENTER -> { saveUndo(); insertNewLine(); e.consume(); }
            case TAB -> { saveUndo(); insertText("    "); e.consume(); }
            case C -> { if (e.isControlDown()) copySelection(); e.consume(); }
            case X -> { if (e.isControlDown()) { copySelection(); deleteSelection(); } e.consume(); }
            case V -> { if (e.isControlDown()) pasteClipboard(); e.consume(); }
            case Z -> { if (e.isControlDown()) undo(); e.consume(); }
            case Y -> { if (e.isControlDown()) redo(); e.consume(); }
            case A -> { if (e.isControlDown()) selectAll(); e.consume(); }
            case S -> { if (e.isControlDown()) saveFile(); e.consume(); }
            default -> {
                if (!e.isControlDown() && !e.isShortcutDown() && e.getText() != null && !e.getText().isEmpty()) {
                    saveUndo();
                    if (hasSelection()) deleteSelection();
                    insertText(e.getText());
                    e.consume();
                }
            }
        }
    }

    private void saveUndo() {
        undoStack.push(document.getText());
        if (undoStack.size() > 200) undoStack.remove(0);
        redoStack.clear();
    }

    private void moveCaret(int lineDelta, int colDelta, boolean extend) {
        if (extend && selectionStartLine == -1) {
            selectionStartLine = caretLine;
            selectionStartCol = caretColumn;
        } else if (!extend) {
            selectionStartLine = -1;
            selectionStartCol = -1;
        }
        int nl = Math.max(0, Math.min(document.getLineCount() - 1, caretLine + lineDelta));
        if (nl != caretLine) {
            caretColumn = Math.min(caretColumn, document.getLine(nl).length());
        }
        caretLine = nl;
        caretColumn = Math.max(0, Math.min(document.getLine(caretLine).length(), caretColumn + colDelta));
        scrollToCaret();
        refresh();
    }

    private void scrollToCaret() {
        double ch = getEditAreaHeight();
        int visibleLines = Math.max(1, (int) (ch / LINE_HEIGHT));
        if (caretLine < scrollOffsetY) {
            scrollOffsetY = Math.max(0, caretLine - 1);
            verticalScroll.setValue(scrollOffsetY);
        } else if (caretLine >= scrollOffsetY + visibleLines) {
            scrollOffsetY = Math.min((int) verticalScroll.getMax(), caretLine - visibleLines + 1);
            verticalScroll.setValue(scrollOffsetY);
        }
        double cw = getEditAreaWidth();
        int visibleChars = Math.max(1, (int) (cw / CHAR_WIDTH));
        if (caretColumn < scrollOffsetX) {
            scrollOffsetX = Math.max(0, caretColumn - 2);
            horizontalScroll.setValue(scrollOffsetX);
        } else if (caretColumn >= scrollOffsetX + visibleChars) {
            scrollOffsetX = Math.max(0, caretColumn - visibleChars + 1);
            horizontalScroll.setValue(scrollOffsetX);
        }
    }

    private void handleMouseClick(MouseEvent e) {
        requestFocus();
        double mx = e.getX();
        double my = e.getY();
        if (mx < LINE_NUMBERS_WIDTH || mx > getWidth() - SCROLLBAR_SIZE) return;
        if (my > getHeight() - SCROLLBAR_SIZE) return;

        int line = (int) (my / LINE_HEIGHT) + scrollOffsetY;
        int col = Math.max(0, (int) ((mx - LINE_NUMBERS_WIDTH) / CHAR_WIDTH));
        if (line < document.getLineCount()) {
            col = Math.min(col, document.getLine(line).length());
            if (!e.isShiftDown()) {
                selectionStartLine = -1;
                selectionStartCol = -1;
            } else if (selectionStartLine == -1) {
                selectionStartLine = caretLine;
                selectionStartCol = caretColumn;
            }
            caretLine = line;
            caretColumn = col;
            refresh();
        }
    }

    private void handleMouseDrag(MouseEvent e) {
        double mx = e.getX();
        double my = e.getY();
        if (mx < LINE_NUMBERS_WIDTH || my > getHeight() - SCROLLBAR_SIZE) return;

        int line = (int) (my / LINE_HEIGHT) + scrollOffsetY;
        int col = Math.max(0, (int) ((mx - LINE_NUMBERS_WIDTH) / CHAR_WIDTH));

        if (selectionStartLine == -1) {
            selectionStartLine = caretLine;
            selectionStartCol = caretColumn;
        }
        if (line >= 0 && line < document.getLineCount()) {
            caretLine = line;
            caretColumn = Math.min(col, document.getLine(line).length());
            refresh();
        }
    }

    boolean hasSelection() { return selectionStartLine != -1; }

    IndexRange getSelectionRange() {
        if (!hasSelection()) return null;
        int sl, sc, el, ec;
        if (selectionStartLine < caretLine || (selectionStartLine == caretLine && selectionStartCol < caretColumn)) {
            sl = selectionStartLine; sc = selectionStartCol; el = caretLine; ec = caretColumn;
        } else {
            sl = caretLine; sc = caretColumn; el = selectionStartLine; ec = selectionStartCol;
        }
        return new IndexRange(document.getPositionFromLineCol(sl, sc), document.getPositionFromLineCol(el, ec));
    }

    String getSelectedText() {
        IndexRange r = getSelectionRange();
        return r == null ? "" : document.getText().substring(r.getStart(), r.getEnd());
    }

    void clearSelection() { selectionStartLine = -1; selectionStartCol = -1; }

    int[] getSelectionStart() {
        return selectionStartLine == -1 ? null : new int[]{selectionStartLine, selectionStartCol};
    }

    private void insertText(String text) {
        String line = document.getLine(caretLine);
        document.setLine(caretLine, line.substring(0, caretColumn) + text + line.substring(caretColumn));
        caretColumn += text.length();
        refresh();
    }

    private void insertNewLine() {
        String line = document.getLine(caretLine);
        String before = line.substring(0, caretColumn);
        String after = line.substring(caretColumn);
        String indent = extractIndent(before);
        document.setLine(caretLine, before);
        document.insertLine(caretLine + 1, indent + after);
        caretLine++;
        caretColumn = indent.length();
        refresh();
    }

    private String extractIndent(String s) {
        int i = 0;
        while (i < s.length() && (s.charAt(i) == ' ' || s.charAt(i) == '\t')) i++;
        return s.substring(0, i);
    }

    private void deleteCharAt(int line, int col) {
        String s = document.getLine(line);
        document.setLine(line, s.substring(0, col) + s.substring(col + 1));
    }

    private void deleteSelection() {
        IndexRange r = getSelectionRange();
        if (r == null) return;
        int[] start = document.getLineColFromPosition(r.getStart());
        int[] end = document.getLineColFromPosition(r.getEnd());
        if (start[0] == end[0]) {
            String line = document.getLine(start[0]);
            document.setLine(start[0], line.substring(0, start[1]) + line.substring(end[1]));
        } else {
            String first = document.getLine(start[0]);
            String last = document.getLine(end[0]);
            document.setLine(start[0], first.substring(0, start[1]) + last.substring(end[1]));
            for (int i = end[0]; i > start[0]; i--) document.removeLine(i);
        }
        caretLine = start[0];
        caretColumn = start[1];
        clearSelection();
        refresh();
    }

    private void copySelection() {
        String s = getSelectedText();
        if (!s.isEmpty()) {
            ClipboardContent cc = new ClipboardContent();
            cc.putString(s);
            Clipboard.getSystemClipboard().setContent(cc);
        }
    }

    private void pasteClipboard() {
        Clipboard cb = Clipboard.getSystemClipboard();
        if (!cb.hasString()) return;
        saveUndo();
        if (hasSelection()) deleteSelection();
        String text = cb.getString().replace("\r\n", "\n").replace("\r", "\n");
        if (text.contains("\n")) {
            String[] lines = text.split("\n", -1);
            String curLine = document.getLine(caretLine);
            String before = curLine.substring(0, caretColumn);
            String after = curLine.substring(caretColumn);
            document.setLine(caretLine, before + lines[0]);
            for (int i = 1; i < lines.length; i++) document.insertLine(caretLine + i, lines[i]);
            String last = document.getLine(caretLine + lines.length - 1);
            document.setLine(caretLine + lines.length - 1, last + after);
            caretLine += lines.length - 1;
            caretColumn = document.getLine(caretLine).length() - after.length();
        } else {
            insertText(text);
        }
        refresh();
    }

    private void selectAll() {
        selectionStartLine = 0; selectionStartCol = 0;
        caretLine = document.getLineCount() - 1;
        caretColumn = document.getLine(caretLine).length();
        refresh();
    }

    private void undo() {
        if (undoStack.isEmpty()) return;
        redoStack.push(document.getText());
        document.setText(undoStack.pop());
        caretLine = 0; caretColumn = 0;
        refresh();
    }

    private void redo() {
        if (redoStack.isEmpty()) return;
        undoStack.push(document.getText());
        document.setText(redoStack.pop());
        caretLine = 0; caretColumn = 0;
        refresh();
    }

    private void saveFile() {
        if (filePath.get() != null) {
            try {
                java.nio.file.Files.writeString(java.nio.file.Path.of(filePath.get()), document.getText());
            } catch (Exception e) {
                NovaIDE.getInstance().getErrorPanel().reportError("Save failed", e.getMessage());
            }
        }
    }

    private void updateStatusBar() {
        NovaIDE.getInstance().getStatusBar().setCursorPosition(caretLine + 1, caretColumn + 1);
    }
}
