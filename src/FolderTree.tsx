import { useCallback, useState } from 'react';
import type { FolderNode, MediaNode } from './types';

interface FolderTreeProps {
  node: FolderNode;
  selectedNodes: Set<MediaNode>;
  indexByPath: Map<string, number>;
  onSelectNode: (
    index: number,
    modifiers: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
}

export function FolderTree({
  node,
  selectedNodes,
  indexByPath,
  onSelectNode,
}: FolderTreeProps) {
  return (
    <ul>
      {node.children.map((child) => (
        <TreeNode
          key={child.path}
          child={child}
          selectedNodes={selectedNodes}
          indexByPath={indexByPath}
          onSelectNode={onSelectNode}
        />
      ))}
    </ul>
  );
}

interface TreeNodeProps {
  child: MediaNode;
  selectedNodes: Set<MediaNode>;
  indexByPath: Map<string, number>;
  onSelectNode: (
    index: number,
    modifiers: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
}

function TreeNode({
  child,
  selectedNodes,
  indexByPath,
  onSelectNode,
}: TreeNodeProps) {
  const index = indexByPath.get(child.path) ?? -1;
  const isSelected = selectedNodes.has(child);
  const [expanded, setExpanded] = useState(child.type === 'folder');

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const hasToggleModifier = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (child.type === 'folder' && !hasToggleModifier && !isShift) {
        setExpanded((prev) => !prev);
      }

      onSelectNode(index, { shiftKey: isShift, ctrlKey: hasToggleModifier });
    },
    [child.type, index, onSelectNode]
  );

  if (child.type === 'folder') {
    const folder = child as FolderNode;
    return (
      <li>
        <span
          className={expanded ? 'folder-open' : 'folder-icon'}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as unknown as React.MouseEvent);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {child.name}
        </span>
        {expanded && (
          <div className={expanded ? '' : 'hidden'}>
            <ul>
              {folder.children.map((c) => (
                <TreeNode
                  key={c.path}
                  child={c}
                  selectedNodes={selectedNodes}
                  indexByPath={indexByPath}
                  onSelectNode={onSelectNode}
                />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <li>
      <span
        className={`file-icon ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {child.name}
      </span>
    </li>
  );
}
