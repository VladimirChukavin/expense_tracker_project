import { Category } from '@/types/models';
import { ChevronRight, FolderTree } from 'lucide-react';
import { useState } from 'react';

interface CategoryTreeProps {
  categories: Category[];
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (id: number) => void;
}

interface TreeNodeProps {
  category: Category;
  children: Category[];
  level: number;
  onSelect?: (category: Category) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (id: number) => void;
}

const TreeNode = ({ category, children, level, onSelect, onEdit, onDelete }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            <ChevronRight
              size={16}
              className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: category.color }}
        />

        <span
          className="flex-1 text-sm"
          onClick={() => onSelect?.(category)}
        >
          {category.name}
        </span>

        {onEdit && (
          <button
            onClick={() => onEdit(category)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Изменить
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(category.id)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Удалить
          </button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map((child: Category) => {
            const grandChildren: Category[] = [];
            return (
              <TreeNode
                key={child.id}
                category={child}
                children={grandChildren}
                level={level + 1}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CategoryTree = ({ categories, onSelect, onEdit, onDelete }: CategoryTreeProps) => {
  const rootCategories = categories.filter(c => !c.parent);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderTree size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Нет категорий</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {rootCategories.map((category) => {
        const children = categories.filter(c => c.parent === category.id);
        return (
          <TreeNode
            key={category.id}
            category={category}
            children={children}
            level={0}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};
