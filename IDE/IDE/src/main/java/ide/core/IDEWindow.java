package ide.core;

import ide.editor.CodeEditor;
import ide.errors.ErrorPanel;
import ide.filesystem.FileExplorer;
import ide.terminal.TerminalPanel;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.FileChooser;
import javafx.stage.DirectoryChooser;

import java.io.File;

public class IDEWindow extends BorderPane {

    private final FileExplorer fileExplorer;
    private final TabPane editorTabs;
    private final TerminalPanel terminal;
    private final ErrorPanel errorPanel;
    private final StatusBar statusBar;

    public IDEWindow() {
        fileExplorer = new FileExplorer(this);
        editorTabs = new TabPane();
        terminal = new TerminalPanel();
        errorPanel = new ErrorPanel();
        statusBar = new StatusBar();

        SplitPane bottomSplit = new SplitPane(terminal, errorPanel);
        bottomSplit.setDividerPositions(0.6);

        SplitPane mainSplit = new SplitPane();
        mainSplit.setDividerPositions(0.2);

        VBox centerArea = new VBox(
            editorTabs,
            bottomSplit
        );
        VBox.setVgrow(editorTabs, javafx.scene.layout.Priority.ALWAYS);
        VBox.setVgrow(bottomSplit, javafx.scene.layout.Priority.NEVER);
        bottomSplit.setMaxHeight(250);

        mainSplit.getItems().addAll(fileExplorer, centerArea);

        MenuBar menuBar = createMenuBar();

        VBox topArea = new VBox(menuBar);
        setTop(topArea);
        setCenter(mainSplit);
        setBottom(statusBar);
    }

    private MenuBar createMenuBar() {
        MenuBar menuBar = new MenuBar();

        Menu fileMenu = new Menu("File");

        MenuItem newFileItem = new MenuItem("New File");
        newFileItem.setOnAction(e -> newFile());

        MenuItem openFileItem = new MenuItem("Open File...");
        openFileItem.setOnAction(e -> openFileWithDialog());

        MenuItem openFolderItem = new MenuItem("Open Folder...");
        openFolderItem.setOnAction(e -> openFolderWithDialog());

        MenuItem saveItem = new MenuItem("Save");
        saveItem.setOnAction(e -> saveCurrentFile());

        MenuItem saveAsItem = new MenuItem("Save As...");
        saveAsItem.setOnAction(e -> saveAsFile());

        MenuItem exitItem = new MenuItem("Exit");
        exitItem.setOnAction(e -> System.exit(0));

        fileMenu.getItems().addAll(
            newFileItem, openFileItem, openFolderItem,
            new SeparatorMenuItem(),
            saveItem, saveAsItem,
            new SeparatorMenuItem(),
            exitItem
        );

        Menu editMenu = new Menu("Edit");

        MenuItem undoItem = new MenuItem("Undo");
        undoItem.setOnAction(e -> {});

        MenuItem redoItem = new MenuItem("Redo");
        redoItem.setOnAction(e -> {});

        MenuItem cutItem = new MenuItem("Cut");
        cutItem.setOnAction(e -> {});

        MenuItem copyItem = new MenuItem("Copy");
        copyItem.setOnAction(e -> {});

        MenuItem pasteItem = new MenuItem("Paste");
        pasteItem.setOnAction(e -> {});

        editMenu.getItems().addAll(
            undoItem, redoItem,
            new SeparatorMenuItem(),
            cutItem, copyItem, pasteItem
        );

        Menu viewMenu = new Menu("View");
        CheckMenuItem terminalItem = new CheckMenuItem("Terminal");
        terminalItem.setSelected(true);
        terminalItem.selectedProperty().addListener((obs, old, val) ->
            terminal.setVisible(val)
        );
        CheckMenuItem errorsItem = new CheckMenuItem("Errors");
        errorsItem.setSelected(true);
        errorsItem.selectedProperty().addListener((obs, old, val) ->
            errorPanel.setVisible(val)
        );
        viewMenu.getItems().addAll(terminalItem, errorsItem);

        Menu runMenu = new Menu("Run");

        MenuItem runItem = new MenuItem("Run");
        runItem.setOnAction(e -> {});

        MenuItem runNoDebugItem = new MenuItem("Run Without Debugging");
        runNoDebugItem.setOnAction(e -> {});

        MenuItem stopItem = new MenuItem("Stop");
        stopItem.setOnAction(e -> {});

        runMenu.getItems().addAll(runItem, runNoDebugItem, stopItem);

        Menu terminalMenu = new Menu("Terminal");

        MenuItem newTermItem = new MenuItem("New Terminal");
        newTermItem.setOnAction(e -> terminal.startProcess("powershell.exe"));

        MenuItem runCmdItem = new MenuItem("Run Command...");
        runCmdItem.setOnAction(e -> terminal.executeCommand(""));

        terminalMenu.getItems().addAll(newTermItem, runCmdItem);

        menuBar.getMenus().addAll(fileMenu, editMenu, viewMenu, runMenu, terminalMenu);
        return menuBar;
    }

    private void newFile() {
        CodeEditor editor = new CodeEditor();
        Tab tab = new Tab("Untitled", editor);
        tab.setUserData(null);
        editorTabs.getTabs().add(tab);
        editorTabs.getSelectionModel().select(tab);
        statusBar.setLanguageMode("New file");
    }

    private void openFileWithDialog() {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Open File");
        File file = chooser.showOpenDialog(getScene().getWindow());
        if (file != null) {
            openFile(file);
        }
    }

    private void openFolderWithDialog() {
        DirectoryChooser chooser = new DirectoryChooser();
        chooser.setTitle("Open Folder");
        File dir = chooser.showDialog(getScene().getWindow());
        if (dir != null) {
            fileExplorer.openProject(dir);
            statusBar.setLanguageMode("Project: " + dir.getName());
        }
    }

    private void saveCurrentFile() {
        Tab tab = editorTabs.getSelectionModel().getSelectedItem();
        if (tab == null) return;

        Object data = tab.getUserData();
        if (data instanceof File file) {
            saveToFile(file);
        } else {
            saveAsFile();
        }
    }

    private void saveAsFile() {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Save As");
        File file = chooser.showSaveDialog(getScene().getWindow());
        if (file != null) {
            Tab tab = editorTabs.getSelectionModel().getSelectedItem();
            if (tab != null) {
                tab.setUserData(file);
                tab.setText(file.getName());
                saveToFile(file);
            }
        }
    }

    private void saveToFile(File file) {
        Tab tab = editorTabs.getSelectionModel().getSelectedItem();
        if (tab == null) return;
        CodeEditor editor = (CodeEditor) tab.getContent();
        try {
            java.nio.file.Files.writeString(file.toPath(), editor.getText());
            statusBar.setLanguageMode("Saved");
        } catch (Exception e) {
            errorPanel.reportError("Save failed", e.getMessage());
        }
    }

    public void openFile(java.io.File file) {
        for (Tab tab : editorTabs.getTabs()) {
            if (tab.getUserData() instanceof java.io.File f && f.equals(file)) {
                editorTabs.getSelectionModel().select(tab);
                return;
            }
        }

        try {
            String content = new String(java.nio.file.Files.readAllBytes(file.toPath()));
            CodeEditor editor = new CodeEditor();
            editor.setText(content);

            Tab tab = new Tab(file.getName(), editor);
            tab.setUserData(file);
            tab.setOnCloseRequest(e -> {
                // TODO: check for unsaved changes
            });

            editorTabs.getTabs().add(tab);
            editorTabs.getSelectionModel().select(tab);
        } catch (Exception e) {
            errorPanel.reportError("Failed to open file: " + file.getName(), e.getMessage());
        }
    }

    public ErrorPanel getErrorPanel() {
        return errorPanel;
    }

    public StatusBar getStatusBar() {
        return statusBar;
    }

    public TerminalPanel getTerminal() {
        return terminal;
    }

    public FileExplorer getFileExplorer() {
        return fileExplorer;
    }
}
