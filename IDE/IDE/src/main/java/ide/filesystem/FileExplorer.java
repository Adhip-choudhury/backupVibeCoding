package ide.filesystem;

import ide.core.IDEWindow;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseButton;
import javafx.collections.ObservableList;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;

import java.io.File;
import java.util.Arrays;

public class FileExplorer extends BorderPane {

    private final IDEWindow window;
    private final TreeView<File> treeView;
    private final Label header;

    public FileExplorer(IDEWindow window) {
        this.window = window;
        setPrefWidth(250);
        getStyleClass().add("file-explorer");

        header = new Label("EXPLORER");
        header.getStyleClass().add("panel-header");

        treeView = new TreeView<>();
        treeView.setShowRoot(false);
        treeView.setCellFactory(tv -> new FileTreeCell());

        treeView.setOnMouseClicked(e -> {
            if (e.getButton() == MouseButton.PRIMARY && e.getClickCount() == 2) {
                TreeItem<File> item = treeView.getSelectionModel().getSelectedItem();
                if (item != null && item.getValue().isFile()) {
                    window.openFile(item.getValue());
                }
            }
        });

        setTop(header);
        setCenter(treeView);
    }

    public void openProject(File directory) {
        if (!directory.isDirectory()) return;

        TreeItem<File> root = createNode(directory);
        treeView.setRoot(root);
        root.setExpanded(true);
    }

    private TreeItem<File> createNode(File file) {
        TreeItem<File> item = new TreeItem<>(file) {
            private boolean loaded = false;

            @Override
            public boolean isLeaf() {
                return file.isFile();
            }

            @Override
            public ObservableList<TreeItem<File>> getChildren() {
                if (!loaded) {
                    loaded = true;
                    if (file.isDirectory()) {
                        File[] files = file.listFiles();
                        if (files != null) {
                            Arrays.sort(files, (a, b) -> {
                                if (a.isDirectory() && !b.isDirectory()) return -1;
                                if (!a.isDirectory() && b.isDirectory()) return 1;
                                return a.getName().compareToIgnoreCase(b.getName());
                            });
                            for (File child : files) {
                                super.getChildren().add(createNode(child));
                            }
                        }
                    }
                }
                return super.getChildren();
            }
        };
        return item;
    }

    private static class FileTreeCell extends TreeCell<File> {
        private static final Image FILE_ICON = null;
        private static final Image FOLDER_ICON = null;
        private static final Image FOLDER_OPEN_ICON = null;

        @Override
        protected void updateItem(File file, boolean empty) {
            super.updateItem(file, empty);
            if (empty || file == null) {
                setText(null);
                setGraphic(null);
            } else {
                setText(file.getName());
                String icon = file.isDirectory() ? "📁 " : "📄 ";
                setText(icon + file.getName());
            }
        }
    }
}
