package ide.editor;

import java.util.ArrayList;
import java.util.List;

public class DocumentModel {

    private final List<StringBuilder> lines;

    public DocumentModel() {
        lines = new ArrayList<>();
        lines.add(new StringBuilder());
    }

    public String getText() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.size(); i++) {
            if (i > 0) sb.append('\n');
            sb.append(lines.get(i));
        }
        return sb.toString();
    }

    public void setText(String text) {
        lines.clear();
        if (text == null || text.isEmpty()) {
            lines.add(new StringBuilder());
            return;
        }
        String[] parts = text.split("\n", -1);
        for (String part : parts) {
            lines.add(new StringBuilder(part));
        }
    }

    public int getLineCount() {
        return lines.size();
    }

    public String getLine(int index) {
        return lines.get(index).toString();
    }

    public String getLineRaw(int index) {
        return lines.get(index).toString();
    }

    public void setLine(int index, String content) {
        lines.set(index, new StringBuilder(content));
    }

    public void insertLine(int index, String content) {
        lines.add(index, new StringBuilder(content));
    }

    public void removeLine(int index) {
        lines.remove(index);
    }

    public List<String> getLines() {
        List<String> result = new ArrayList<>();
        for (StringBuilder sb : lines) {
            result.add(sb.toString());
        }
        return result;
    }

    public int getPositionFromLineCol(int line, int col) {
        int pos = 0;
        for (int i = 0; i < line && i < lines.size(); i++) {
            pos += lines.get(i).length() + 1;
        }
        return pos + Math.min(col, lines.get(line).length());
    }

    public int[] getLineColFromPosition(int position) {
        int pos = 0;
        for (int i = 0; i < lines.size(); i++) {
            int lineLen = lines.get(i).length() + 1;
            if (pos + lineLen > position) {
                return new int[]{i, position - pos};
            }
            pos += lineLen;
        }
        int last = lines.size() - 1;
        return new int[]{last, lines.get(last).length()};
    }
}
