package ide.terminal;

import javafx.application.Platform;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.scene.text.TextFlow;

import java.io.*;
import java.util.concurrent.CompletableFuture;

public class TerminalPanel extends BorderPane {

    private final TextFlow outputArea;
    private final TextField inputField;
    private final ScrollPane scrollPane;
    private final Label header;

    private Process currentProcess;
    private BufferedWriter processWriter;
    private boolean processMode = false;

    private static final Font TERMINAL_FONT = Font.font("Consolas", 13);
    private final StringBuilder commandHistory = new StringBuilder();

    public TerminalPanel() {
        setPrefHeight(200);
        getStyleClass().add("terminal-panel");

        header = new Label("TERMINAL");
        header.getStyleClass().add("panel-header");

        outputArea = new TextFlow();
        outputArea.setPrefHeight(140);
        outputArea.setFocusTraversable(false);

        scrollPane = new ScrollPane(outputArea);
        scrollPane.setFitToWidth(true);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.ALWAYS);

        inputField = new TextField();
        inputField.setFont(TERMINAL_FONT);
        inputField.setPromptText("> Enter command...");

        inputField.setOnKeyPressed(e -> {
            if (e.getCode() == KeyCode.ENTER) {
                executeCommand(inputField.getText());
                inputField.clear();
            }
        });

        VBox bottomArea = new VBox(header, scrollPane, inputField);
        VBox.setVgrow(scrollPane, javafx.scene.layout.Priority.ALWAYS);

        setCenter(bottomArea);

        appendOutput("Nova IDE Terminal v0.1\n");
        appendOutput("Type commands or use Ctrl+` to toggle.\n\n");
    }

    public void executeCommand(String command) {
        if (command == null || command.trim().isEmpty()) return;

        commandHistory.append(command).append("\n");
        appendOutput("> " + command + "\n");

        if (processMode && processWriter != null) {
            try {
                processWriter.write(command + "\n");
                processWriter.flush();
            } catch (IOException e) {
                appendOutput("[ERROR] " + e.getMessage() + "\n");
                processMode = false;
            }
            return;
        }

        // Built-in commands
        if (command.equals("clear") || command.equals("cls")) {
            outputArea.getChildren().clear();
            return;
        }

        if (command.startsWith("cd ")) {
            String path = command.substring(3).trim();
            try {
                System.setProperty("user.dir", new File(path).getCanonicalPath());
                appendOutput("  Changed to: " + System.getProperty("user.dir") + "\n");
            } catch (Exception e) {
                appendOutput("  [ERROR] " + e.getMessage() + "\n");
            }
            return;
        }

        // Execute system command via PowerShell
        CompletableFuture.runAsync(() -> {
            try {
                ProcessBuilder pb = new ProcessBuilder(
                    "powershell.exe",
                    "-NoProfile",
                    "-Command",
                    command
                );
                pb.redirectErrorStream(true);
                Process process = pb.start();

                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        final String output = line;
                        Platform.runLater(() -> appendOutput("  " + output + "\n"));
                    }
                }

                int exitCode = process.waitFor();
                Platform.runLater(() -> appendOutput("\n  Exit code: " + exitCode + "\n\n"));
            } catch (Exception e) {
                Platform.runLater(() ->
                    appendOutput("  [ERROR] " + e.getMessage() + "\n"));
            }
        });
    }

    public void startProcess(String command) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "powershell.exe",
                "-NoProfile"
            );
            pb.redirectErrorStream(true);
            currentProcess = pb.start();

            processWriter = new BufferedWriter(
                new OutputStreamWriter(currentProcess.getOutputStream()));
            processMode = true;

            // Read output in background
            Thread reader = new Thread(() -> {
                try (BufferedReader reader2 = new BufferedReader(
                        new InputStreamReader(currentProcess.getInputStream()))) {
                    String line;
                    while ((line = reader2.readLine()) != null) {
                        final String output = line;
                        Platform.runLater(() -> appendOutput(output + "\n"));
                    }
                } catch (IOException e) {
                    // process ended
                }
                processMode = false;
            }, "terminal-reader");
            reader.setDaemon(true);
            reader.start();

            appendOutput("[Started persistent shell]\n");
        } catch (Exception e) {
            appendOutput("[ERROR starting shell] " + e.getMessage() + "\n");
        }
    }

    private void appendOutput(String text) {
        Text textNode = new Text(text);
        textNode.setFill(Color.web("#d4d4d4"));
        textNode.setFont(TERMINAL_FONT);
        outputArea.getChildren().add(textNode);

        Platform.runLater(() -> {
            scrollPane.setVvalue(1.0);
        });
    }

    public void stopProcess() {
        if (currentProcess != null) {
            currentProcess.destroy();
            processMode = false;
            appendOutput("[Process terminated]\n");
        }
    }
}
