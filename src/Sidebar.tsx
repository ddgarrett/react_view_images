import type { FolderNode, MediaNode } from './types';
import { FolderTree } from './FolderTree';

interface SidebarProps {
  treeData: FolderNode | null;
  selectedNodes: Set<MediaNode>;
  indexByPath: Map<string, number>;
  onSelectNode: (
    index: number,
    modifiers: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
  onLoadTree: (data: FolderNode) => void;
  width: number;
}

export function Sidebar({
  treeData,
  selectedNodes,
  indexByPath,
  onSelectNode,
  onLoadTree,
  width,
}: SidebarProps) {
  const handleNew = async () => {
    const data = await window.electronAPI.openFolder();
    if (data) onLoadTree(data);
  };

  const handleSave = async () => {
    if (!treeData) {
      alert('No folder loaded to save!');
      return;
    }
    const jsonString = JSON.stringify(treeData, null, 2);
    const success = await window.electronAPI.saveFile(jsonString);
    if (success) console.log('File saved successfully.');
  };

  const handleOpen = async () => {
    const data = await window.electronAPI.openFile();
    if (data) onLoadTree(data);
  };

  const handleImportCsv = async () => {
    const data = await window.electronAPI.openCsv();
    if (data) onLoadTree(data);
  };

  return (
    <div className="sidebar" id="sidebar" style={{ width: `${width}px` }}>
      <div className="tree-container" id="tree-container">
        {treeData ? (
          <>
            <div
              className="folder-open"
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
            >
              {treeData.name}
            </div>
            <FolderTree
              node={treeData}
              selectedNodes={selectedNodes}
              indexByPath={indexByPath}
              onSelectNode={onSelectNode}
            />
          </>
        ) : null}
      </div>
      <div className="sidebar-buttons">
        <button type="button" id="btn-new" onClick={handleNew}>
          New
        </button>
        <button type="button" id="btn-open" onClick={handleOpen}>
          Open
        </button>
        <button type="button" id="btn-save" onClick={handleSave}>
          Save
        </button>
        <button type="button" id="btn-import-csv" onClick={handleImportCsv}>
          Import from CSV
        </button>
      </div>
    </div>
  );
}
