package ide.editor;

import javafx.scene.paint.Color;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SyntaxHighlighter {

    private final Map<String, LanguageConfig> languages = new HashMap<>();

    public SyntaxHighlighter() {
        initJavaRules();
        initPythonRules();
        initJavaScriptRules();
    }

    private void initJavaRules() {
        LanguageConfig java = new LanguageConfig();
        java.keywords = Set.of(
            "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
            "class", "const", "continue", "default", "do", "double", "else", "enum",
            "extends", "final", "finally", "float", "for", "goto", "if", "implements",
            "import", "instanceof", "int", "interface", "long", "native", "new",
            "package", "private", "protected", "public", "return", "short", "static",
            "strictfp", "super", "switch", "synchronized", "this", "throw", "throws",
            "transient", "try", "void", "volatile", "while", "var", "record", "sealed",
            "permits", "yield"
        );
        java.types = Set.of(
            "String", "Integer", "Boolean", "Double", "Float", "Long", "Short",
            "Byte", "Character", "Object", "Math", "System", "List", "ArrayList",
            "Map", "HashMap", "Set", "HashSet", "Optional", "Stream", "Collectors",
            "Arrays", "Collections", "Exception", "RuntimeException", "Error",
            "Thread", "Runnable", "Callable", "Future", "Path", "Files", "File"
        );
        java.annotations = List.of("@Override", "@Deprecated", "@SuppressWarnings",
            "@FunctionalInterface", "@SafeVarargs", "@Retention", "@Target",
            "@Documented", "@Inherited"
        );
        languages.put("java", java);
    }

    private void initPythonRules() {
        LanguageConfig py = new LanguageConfig();
        py.keywords = Set.of(
            "False", "None", "True", "and", "as", "assert", "async", "await",
            "break", "class", "continue", "def", "del", "elif", "else", "except",
            "finally", "for", "from", "global", "if", "import", "in", "is",
            "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
            "try", "while", "with", "yield", "match", "case", "type"
        );
        py.types = Set.of(
            "int", "float", "str", "bool", "list", "dict", "tuple", "set",
            "NoneType", "object", "type", "Exception", "BaseException",
            "self", "cls"
        );
        languages.put("python", py);
    }

    private void initJavaScriptRules() {
        LanguageConfig js = new LanguageConfig();
        js.keywords = Set.of(
            "async", "await", "break", "case", "catch", "class", "const",
            "continue", "debugger", "default", "delete", "do", "else", "export",
            "extends", "finally", "for", "function", "if", "import", "in",
            "instanceof", "let", "new", "of", "return", "static", "super",
            "switch", "this", "throw", "try", "typeof", "var", "void",
            "while", "with", "yield", "from"
        );
        js.types = Set.of(
            "String", "Number", "Boolean", "Object", "Array", "Function",
            "Promise", "Map", "Set", "Symbol", "RegExp", "Error",
            "console", "Math", "JSON", "Date", "window", "document",
            "null", "undefined", "true", "false", "NaN", "Infinity"
        );
        languages.put("javascript", js);
    }

    public Result highlight(String line) {
        List<Token> tokens = new ArrayList<>();
        if (line == null || line.isEmpty()) {
            tokens.add(new Token(0, 0, Color.web("#d4d4d4")));
            return new Result(tokens);
        }

        // Use a combined approach - detect language from context, default to all rules
        LanguageConfig lang = languages.get("java");

        int i = 0;
        while (i < line.length()) {
            char c = line.charAt(i);

            // Single-line comments: //
            if (c == '/' && i + 1 < line.length() && line.charAt(i + 1) == '/') {
                tokens.add(new Token(i, line.length(), Color.web("#6a9955")));
                return new Result(tokens);
            }

            // Multi-line comment start /* ... */
            if (c == '/' && i + 1 < line.length() && line.charAt(i + 1) == '*') {
                tokens.add(new Token(i, line.length(), Color.web("#6a9955")));
                return new Result(tokens);
            }

            // Strings
            if (c == '"' || c == '\'') {
                int end = findStringEnd(line, i);
                tokens.add(new Token(i, end + 1, Color.web("#ce9178")));
                i = end + 1;
                continue;
            }

            // Numbers
            if (Character.isDigit(c) && (i == 0 || !Character.isLetterOrDigit(line.charAt(i - 1)))) {
                int end = i;
                while (end < line.length() && (Character.isDigit(line.charAt(end)) || line.charAt(end) == '.' || line.charAt(end) == 'f' || line.charAt(end) == 'L' || line.charAt(end) == 'l' || line.charAt(end) == 'd' || line.charAt(end) == 'D')) {
                    end++;
                }
                tokens.add(new Token(i, end, Color.web("#b5cea8")));
                i = end;
                continue;
            }

            // Annotations
            if (c == '@') {
                int end = i + 1;
                while (end < line.length() && (Character.isLetterOrDigit(line.charAt(end)) || line.charAt(end) == '.')) {
                    end++;
                }
                tokens.add(new Token(i, end, Color.web("#c586c0")));
                i = end;
                continue;
            }

            // Multi-character operators
            if (i + 1 < line.length()) {
                String twoChar = line.substring(i, i + 2);
                if (twoChar.equals("==") || twoChar.equals("!=") || twoChar.equals("<=") ||
                    twoChar.equals(">=") || twoChar.equals("&&") || twoChar.equals("||") ||
                    twoChar.equals("++") || twoChar.equals("--") || twoChar.equals("+=") ||
                    twoChar.equals("-=") || twoChar.equals("*=") || twoChar.equals("/=") ||
                    twoChar.equals("->") || twoChar.equals("::")) {
                    tokens.add(new Token(i, i + 2, Color.web("#d4d4d4")));
                    i += 2;
                    continue;
                }
            }

            // Words (keywords, types, identifiers)
            if (Character.isLetter(c) || c == '_' || c == '$') {
                int end = i;
                while (end < line.length() && (Character.isLetterOrDigit(line.charAt(end)) || line.charAt(end) == '_' || line.charAt(end) == '$')) {
                    end++;
                }
                String word = line.substring(i, end);

                Color color;
                if (lang.keywords.contains(word)) {
                    color = Color.web("#569cd6"); // blue for keywords
                } else if (lang.types.contains(word)) {
                    color = Color.web("#4ec9b0"); // teal for types
                } else if (end < line.length() && line.charAt(end) == '(') {
                    color = Color.web("#dcdcaa"); // yellow for functions
                } else {
                    color = Color.web("#d4d4d4"); // default text
                }
                tokens.add(new Token(i, end, color));
                i = end;
                continue;
            }

            // Operators and punctuation
            String ops = "+-*/%=<>!&|^~?:;,.";

            if (ops.indexOf(c) >= 0 || c == '(' || c == ')' || c == '{' || c == '}' || c == '[' || c == ']') {
                tokens.add(new Token(i, i + 1, Color.web("#d4d4d4")));
                i++;
                continue;
            }

            // Default: draw whitespace or unknown characters as text color
            tokens.add(new Token(i, i + 1, Color.web("#d4d4d4")));
            i++;
        }

        if (tokens.isEmpty()) {
            tokens.add(new Token(0, 0, Color.web("#d4d4d4")));
        }

        return new Result(tokens);
    }

    private int findStringEnd(String line, int start) {
        char quote = line.charAt(start);
        int i = start + 1;
        while (i < line.length()) {
            if (line.charAt(i) == '\\') {
                i += 2;
                continue;
            }
            if (line.charAt(i) == quote) {
                return i;
            }
            i++;
        }
        return line.length() - 1;
    }

    public record Token(int start, int end, Color color) {}
    public record Result(List<Token> tokens) {
        public List<Token> getTokens() { return tokens; }
    }

    private static class LanguageConfig {
        Set<String> keywords = Set.of();
        Set<String> types = Set.of();
        List<String> annotations = List.of();
    }
}
