package ide.errors;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.paint.Color;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class ErrorPanel extends BorderPane {

    private final TableView<Diagnostic> tableView;
    private final ObservableList<Diagnostic> diagnostics;
    private final Label header;

    public enum Severity {
        ERROR, WARNING, INFO
    }

    @SuppressWarnings("unchecked")
    public ErrorPanel() {
        setPrefHeight(200);
        getStyleClass().add("error-panel");

        header = new Label("PROBLEMS");
        header.getStyleClass().add("panel-header");

        diagnostics = FXCollections.observableArrayList();

        TableColumn<Diagnostic, String> severityCol = new TableColumn<>("");
        severityCol.setPrefWidth(30);
        severityCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || getTableRow() == null || getTableRow().getItem() == null) {
                    setText(null);
                } else {
                    Diagnostic d = getTableRow().getItem();
                    String icon = switch (d.severity) {
                        case ERROR -> "\u2716";
                        case WARNING -> "\u26A0";
                        case INFO -> "\u2139";
                    };
                    setText(icon);
                    setStyle(switch (d.severity) {
                        case ERROR -> "-fx-text-fill: #f14c4c;";
                        case WARNING -> "-fx-text-fill: #cca700;";
                        case INFO -> "-fx-text-fill: #3794ff;";
                    });
                }
            }
        });

        TableColumn<Diagnostic, String> messageCol = new TableColumn<>("Message");
        messageCol.setPrefWidth(400);
        messageCol.setCellValueFactory(d -> d.getValue().messageProperty());

        TableColumn<Diagnostic, String> fileCol = new TableColumn<>("File");
        fileCol.setPrefWidth(200);
        fileCol.setCellValueFactory(d -> d.getValue().fileProperty());

        TableColumn<Diagnostic, String> lineCol = new TableColumn<>("Line");
        lineCol.setPrefWidth(60);
        lineCol.setCellValueFactory(d -> d.getValue().lineProperty());

        TableColumn<Diagnostic, String> timeCol = new TableColumn<>("Time");
        timeCol.setPrefWidth(80);
        timeCol.setCellValueFactory(d -> d.getValue().timeProperty());

        tableView = new TableView<>(diagnostics);
        tableView.getColumns().addAll(
            severityCol, messageCol, fileCol, lineCol, timeCol
        );
        tableView.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN);

        setTop(header);
        setCenter(tableView);
    }

    public void reportError(String message, String details) {
        report(message, details, Severity.ERROR);
    }

    public void reportWarning(String message, String details) {
        report(message, details, Severity.WARNING);
    }

    public void reportInfo(String message, String details) {
        report(message, details, Severity.INFO);
    }

    public void report(String message, String details, Severity severity) {
        Diagnostic diagnostic = new Diagnostic(
            severity,
            message,
            details != null ? details : "",
            "1",
            LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"))
        );
        diagnostics.add(0, diagnostic);

        if (diagnostics.size() > 500) {
            diagnostics.remove(diagnostics.size() - 1);
        }
    }

    public void clear() {
        diagnostics.clear();
    }

    public static class Diagnostic {
        private final Severity severity;
        private final String message;
        private final String file;
        private final String line;
        private final String time;

        public Diagnostic(Severity severity, String message, String file, String line, String time) {
            this.severity = severity;
            this.message = message;
            this.file = file;
            this.line = line;
            this.time = time;
        }

        public javafx.beans.property.SimpleStringProperty messageProperty() {
            return new javafx.beans.property.SimpleStringProperty(message);
        }

        public javafx.beans.property.SimpleStringProperty fileProperty() {
            return new javafx.beans.property.SimpleStringProperty(file);
        }

        public javafx.beans.property.SimpleStringProperty lineProperty() {
            return new javafx.beans.property.SimpleStringProperty(line);
        }

        public javafx.beans.property.SimpleStringProperty timeProperty() {
            return new javafx.beans.property.SimpleStringProperty(time);
        }
    }
}
