interface Category {
  id: string;
  name: string;
  icon?: any; // Can be a component or an emoji string
}

interface CategorySelectorProps {
  categories: Category[];
  selectedTemplate: string | null;
  onSelect: (id: string) => void;
  allowedCategories?: string[] | null;
}

export default function CategorySelector({ categories, selectedTemplate, onSelect, allowedCategories }: CategorySelectorProps) {
  const visibleCategories = allowedCategories 
    ? categories.filter(t => allowedCategories.includes(t.id) || t.id === 'general')
    : categories;

  return (
    <section className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
        {visibleCategories.map(t => {
          const Icon = t.icon;
          const isSelected = selectedTemplate === t.id;
          return (
            <button key={t.id} type="button" onClick={() => onSelect(t.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 font-bold border-2 ${
                isSelected ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20 scale-105' : 'bg-white border-transparent text-slate-500 hover:border-rose-200 hover:text-rose-500 shadow-sm'
              }`}>
              <span className={`text-xl ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {typeof Icon === 'function' ? <Icon /> : Icon}
              </span>
              <span className="text-[14px]">{t.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
