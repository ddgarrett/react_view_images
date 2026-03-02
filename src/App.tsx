import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FileNode, FolderNode, MediaNode, ShowFilter } from './types';
import { Sidebar } from './Sidebar';
import { MediaGrid } from './MediaGrid';
import { BottomBar } from './BottomBar';

function extractMedia(node: MediaNode): MediaNode[] {
  if (node.type === 'folder') {
    return node.children.flatMap(extractMedia);
  }
  return [node];
}

function flattenTree(node: FolderNode): MediaNode[] {
  const out: MediaNode[] = [];
  function walk(n: FolderNode) {
    for (const c of n.children) {
      out.push(c);
      if (c.type === 'folder') walk(c as FolderNode);
    }
  }
  walk(node);
  return out;
}

function applyShowFilter(
  media: MediaNode[],
  showFilter: ShowFilter
): MediaNode[] {
  const files = media.filter((n): n is FileNode => n.type !== 'folder');
  if (showFilter === 'all') return files;
  return files.filter((node) => {
    const status = node.status ?? 'tbd';
    const level = node.reviewLevel ?? 0;
    switch (showFilter) {
      case 'tbd':
        return status === 'tbd';
      case 'possible_dup':
        return (level < 3 && status === 'tbd') || status === 'dup';
      case 'possible_good_plus':
        return level > 3 || status === 'tbd';
      case 'possible_best':
        return level > 4 || status === 'tbd';
      default:
        return true;
    }
  });
}

export default function App() {
  const [treeData, setTreeData] = useState<FolderNode | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<MediaNode>>(new Set());
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [showFilter, setShowFilter] = useState<ShowFilter>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const lastSelectedIndexRef = useRef<number | null>(null);

  const selectedMedia = useCallback(() => {
    let allMedia: MediaNode[] = [];
    if (selectedNodes.size > 0) {
      selectedNodes.forEach((node) => {
        allMedia = allMedia.concat(extractMedia(node));
      });
    } else if (treeData) {
      allMedia = extractMedia(treeData);
    }
    const unique = new Map<string, MediaNode>();
    allMedia.forEach((item) => unique.set(item.path, item));
    return applyShowFilter(Array.from(unique.values()), showFilter);
  }, [treeData, selectedNodes, showFilter, refreshKey]);

  const media = selectedMedia();
  const totalPages = Math.ceil(media.length / itemsPerPage) || 1;
  const clampedPage = Math.max(1, Math.min(currentPage, totalPages));

  const flatNodes = useMemo(
    () => (treeData ? [treeData, ...flattenTree(treeData)] : []),
    [treeData]
  );
  const indexByPath = useMemo(() => {
    const m = new Map<string, number>();
    flatNodes.forEach((n, i) => m.set(n.path, i));
    return m;
  }, [flatNodes]);

  const onSelectNode = useCallback(
    (index: number, modifiers: { shiftKey: boolean; ctrlKey: boolean }) => {
      const node = flatNodes[index];
      if (!node) return;
      const { shiftKey, ctrlKey } = modifiers;
      if (shiftKey && lastSelectedIndexRef.current !== null) {
        const start = Math.min(lastSelectedIndexRef.current, index);
        const end = Math.max(lastSelectedIndexRef.current, index);
        setSelectedNodes((prev) => {
          const next = ctrlKey ? new Set(prev) : new Set<MediaNode>();
          for (let i = start; i <= end; i++) {
            const n = flatNodes[i];
            if (!n) continue;
            if (ctrlKey) {
              if (next.has(n)) next.delete(n);
              else next.add(n);
            } else {
              next.add(n);
            }
          }
          return next;
        });
      } else if (!ctrlKey) {
        setSelectedNodes(new Set([node]));
      } else {
        setSelectedNodes((prev) => {
          const next = new Set(prev);
          if (next.has(node)) next.delete(node);
          else next.add(node);
          return next;
        });
      }
      lastSelectedIndexRef.current = index;
    },
    [flatNodes]
  );

  useEffect(() => {
    if (currentPage !== clampedPage) setCurrentPage(clampedPage);
  }, [clampedPage, currentPage]);

  const handleLoadTree = useCallback((data: FolderNode) => {
    setTreeData(data);
    setSelectedNodes(new Set());
    setCurrentPage(1);
    lastSelectedIndexRef.current = null;
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const w = e.clientX;
      if (w > 150 && w < window.innerWidth * 0.8) setSidebarWidth(w);
    };
    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      onUp();
    };
  }, [isResizing]);

  return (
    <div className="container">
      <Sidebar
        treeData={treeData}
        selectedNodes={selectedNodes}
        indexByPath={indexByPath}
        onSelectNode={onSelectNode}
        onLoadTree={handleLoadTree}
        width={sidebarWidth}
      />
      <div
        className="resizer"
        id="drag-bar"
        onMouseDown={() => setIsResizing(true)}
        role="separator"
        aria-orientation="vertical"
      />
      <div className="main-content">
        <MediaGrid
          media={media}
          currentPage={clampedPage}
          itemsPerPage={itemsPerPage}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
        <BottomBar
          currentPage={clampedPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          showFilter={showFilter}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(n) => {
            setItemsPerPage(n);
            setCurrentPage(1);
          }}
          onShowFilterChange={setShowFilter}
        />
      </div>
    </div>
  );
}
