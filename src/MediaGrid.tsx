import { useCallback, useRef, useState } from 'react';
import type { FileNode, MediaNode } from './types';

const STATUS_MENU_ITEMS: {
  label: string;
  status: FileNode['status'];
  reviewLevel: 0 | 1 | 2 | 3 | 4 | 5;
}[] = [
  { label: 'Reject', status: 'reject', reviewLevel: 0 },
  { label: 'Poor Quality', status: 'bad', reviewLevel: 1 },
  { label: 'Duplicate', status: 'dup', reviewLevel: 2 },
  { label: 'Just Okay', status: 'ok', reviewLevel: 3 },
  { label: 'Good', status: 'good', reviewLevel: 4 },
  { label: 'Best', status: 'best', reviewLevel: 5 },
  { label: 'TBD', status: 'tbd', reviewLevel: 0 },
];

interface MediaGridProps {
  media: MediaNode[];
  currentPage: number;
  itemsPerPage: number;
  onRefresh: () => void;
}

export function MediaGrid({
  media,
  currentPage,
  itemsPerPage,
  onRefresh,
}: MediaGridProps) {
  const gridSize = Math.sqrt(itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const itemsToShow = media.slice(
    startIndex,
    Math.min(startIndex + itemsPerPage, media.length)
  );

  return (
    <div
      className="grid-container"
      id="grid-container"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {itemsToShow.map((item) => {
        if (item.type === 'folder') return null;
        return (
          <MediaItem
            key={item.path}
            fileNode={item as FileNode}
            onRefresh={onRefresh}
          />
        );
      })}
    </div>
  );
}

interface MediaItemProps {
  fileNode: FileNode;
  onRefresh: () => void;
}

function MediaItem({ fileNode, onRefresh }: MediaItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleDoubleClick = useCallback(() => {
    void window.electronAPI.openMediaViewer(fileNode.path, fileNode.type);
  }, [fileNode.path, fileNode.type]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleStatusSelect = useCallback(
    (status: FileNode['status'], reviewLevel: 0 | 1 | 2 | 3 | 4 | 5) => {
      fileNode.status = status;
      fileNode.reviewLevel = reviewLevel;
      setContextMenu(null);
      onRefresh();
    },
    [fileNode, onRefresh]
  );

  return (
    <>
      <div
        className="media-item"
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {fileNode.type === 'image' ? (
          <img src={`file://${fileNode.path}`} alt="" />
        ) : fileNode.type === 'video' ? (
          <>
            <video
              src={`file://${fileNode.path}#t=0.1`}
              preload="metadata"
              muted
            />
            <div className="play-icon">▶</div>
          </>
        ) : null}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSelect={handleStatusSelect}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

interface ContextMenuProps {
  x: number;
  y: number;
  onSelect: (
    status: FileNode['status'],
    reviewLevel: 0 | 1 | 2 | 3 | 4 | 5
  ) => void;
  onClose: () => void;
}

function ContextMenu({ x, y, onSelect, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        className="context-menu"
        ref={ref}
        style={{
          position: 'fixed',
          left: x,
          top: y,
          background: '#2d2d2d',
          border: '1px solid #444',
          borderRadius: '4px',
          padding: '4px',
          zIndex: 1000,
          minWidth: '160px',
        }}
      >
        {STATUS_MENU_ITEMS.map(({ label, status, reviewLevel }) => (
          <div
            key={label}
            role="button"
            tabIndex={0}
            style={{ padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => onSelect(status, reviewLevel)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                onSelect(status, reviewLevel);
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
        }}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
    </>
  );
}
