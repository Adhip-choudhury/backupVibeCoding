package ide.core;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

public class NovaIDE extends Application {

    private static NovaIDE instance;
    private IDEWindow window;

    public static NovaIDE getInstance() {
        return instance;
    }

    @Override
    public void start(Stage primaryStage) {
        instance = this;

        window = new IDEWindow();
        Scene scene = new Scene(window, 1280, 800);

        String css = getClass().getResource("/styles/main.css").toExternalForm();
        scene.getStylesheets().add(css);

        primaryStage.setTitle("Nova IDE");
        primaryStage.setScene(scene);
        primaryStage.setMinWidth(800);
        primaryStage.setMinHeight(600);
        primaryStage.show();
    }

    public IDEWindow getWindow() { return window; }
    public StatusBar getStatusBar() { return window != null ? window.getStatusBar() : null; }
    public ide.errors.ErrorPanel getErrorPanel() { return window != null ? window.getErrorPanel() : null; }
    public ide.terminal.TerminalPanel getTerminal() { return window != null ? window.getTerminal() : null; }

    public static void main(String[] args) {
        launch(args);
    }
}
