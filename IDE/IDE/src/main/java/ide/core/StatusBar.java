package ide.core;

import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;

public class StatusBar extends HBox {

    private final Label cursorPosition;
    private final Label languageMode;
    private final Label encodingInfo;

    public StatusBar() {
        getStyleClass().add("status-bar");

        cursorPosition = new Label("Ln 1, Col 1");
        languageMode = new Label("Plain Text");
        encodingInfo = new Label("UTF-8");

        Label spacer = new Label();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        getChildren().addAll(
            cursorPosition,
            new Label("  |  "),
            languageMode,
            new Label("  |  "),
            spacer,
            encodingInfo
        );
    }

    public void setCursorPosition(int line, int column) {
        cursorPosition.setText("Ln " + line + ", Col " + column);
    }

    public void setLanguageMode(String mode) {
        languageMode.setText(mode);
    }
}
