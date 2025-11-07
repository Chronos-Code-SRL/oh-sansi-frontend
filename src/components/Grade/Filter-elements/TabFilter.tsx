interface TabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  vertical?: boolean;
}

export function Tabs({ tabs, activeTab, setActiveTab, vertical = false }: TabsProps) {
  return (
    <div className={vertical ? "w-1/3 border-r border-gray-200 py-2 flex flex-col" : "flex space-x-2 overflow-x-auto px-3 py-2"}>
      {tabs.map((tab) => (
        <div
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 text-sm cursor-pointer ${
            activeTab === tab
              ? vertical
                ? "bg-blue-50 text-blue-600 font-medium border-l-2 border-blue-600"
                : "bg-blue-50 text-blue-600 font-medium border-b-2 border-blue-600"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}
