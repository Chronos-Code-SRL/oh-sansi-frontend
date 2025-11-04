import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { getUser, getUserAreas } from "../api/services/authService";
import { UPermission } from "../types/enums/UPermissions";
import {ListIcon, ChevronDownIcon,HorizontaLDots,GridIcon,GroupIcon,UserIcon,Slider,PencilIcon,} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useOlympiad } from "../context/OlympiadContext";
import { Phase } from "../types/Phase";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;  
    permission?: UPermission
  }[];
  permission?: UPermission;
};

const rolePermissions: Record<number, UPermission[]> = {
  1: [ // Admin
    UPermission.CREATE_OLYMPIAD,
    UPermission.CONFIGURE_AREAS,
    UPermission.REGISTER_ACADEMIC_RESPONSIBLE,
    UPermission.REGISTER_EVALUATOR,
    UPermission.REGISTER_COMPETITOR,
  ],
  2: [ // Responsable Académico
    UPermission.REGISTER_EVALUATOR,
    UPermission.REGISTER_COMPETITOR,
    UPermission.GRADE_COMPETITOR,
    UPermission.EDIT_SCORE_CUT,
    UPermission.FILTER_COMPETITOR_BY_AREA,
  ],
  3: [ // Evaluador
    UPermission.GRADE_COMPETITOR,
    UPermission.FILTER_COMPETITOR_BY_AREA,
  ],
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Olimpiadas",
    subItems: [
      { name: "Crear Olimpiada", path: "/Olimpiada", pro: false, permission: UPermission.CREATE_OLYMPIAD },
      { name: "Configurar Áreas", path: "/VerOlimpiadas", pro: false, permission: UPermission.CONFIGURE_AREAS },
    ],
    
  },
  {
    icon: <UserIcon />,
    name: "Registro",
    subItems: [
      { name: "Registrar Responsable Académico", path: "/Academic-Manager-register", pro: false, permission: UPermission.REGISTER_ACADEMIC_RESPONSIBLE },
      { name: "Registrar Evaluador", path: "/Evaluator-register", pro: false, permission: UPermission.REGISTER_EVALUATOR },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "Registrar Competidores",
    path: "/registration",
    permission: UPermission.REGISTER_COMPETITOR
  },
  {
    icon: <ListIcon />,
    name: "Calificar Competidores",
    path: "/calificaciones",
    subItems: [], 
    permission: UPermission.GRADE_COMPETITOR
  },
  {
    icon: <PencilIcon />,
    name: "Editar Umbral",
    path: "/editar-umbral",
    subItems: [], 
    permission: UPermission.EDIT_SCORE_CUT, 
  },
  {
    icon: <Slider />,
    name: "Filtrar lista de Competidores",
    path: "/filtros-de-lista",
    permission: UPermission.FILTER_COMPETITOR_BY_AREA,
  },
  
];
const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const user = getUser();
  const userPerms = user ? rolePermissions[user.roles_id] || [] : [];
  const { selectedOlympiad } = useOlympiad();
  const [userAreas, setUserAreas] = useState<{id:number; name: string; path: string }[]>([]);
  const [menuItems, setMenuItems] = useState(navItems);
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    const fetchUserAreas = async (olympiadId: number) => {
      try {
        const res = await getUserAreas(olympiadId);
        console.log("Respuesta de getUserAreas:", res);
        const formatted = res.areas.map((area) => ({
          id: area.id,
          name: area.name,
          path: `/calificaciones/${area.id}/${area.name.toLowerCase()}`,
        }));
        console.log("Respuesta de getUserAreas:", res);

        setUserAreas(formatted);
      } catch (error) {
        console.error("Error obteniendo áreas del usuario:", error);
      }
    };

    if (selectedOlympiad?.id) {
    fetchUserAreas(selectedOlympiad.id);
    }
  }, [selectedOlympiad]);


  useEffect(() => {
    // Solo actualizamos si ya tenemos las áreas
    if (userAreas.length > 0) {
      const updated = navItems.map((item) => {
        if (item.name === "Calificar Competidores") {
          return { ...item, subItems: userAreas };
        }
        return item;
      });
      setMenuItems(updated);
    } else {
      setMenuItems(navItems);
    }
  }, [userAreas]);

  // Filtrar ítems visibles según permisos
  useEffect(() => {
    const filteredMenu = navItems
      .map((item) => {
        // Filtrar subitems según permisos
        const visibleSubItems = item.subItems
          ? item.subItems.filter(
              (sub) => !sub.permission || userPerms.includes(sub.permission)
            )
          : [];

        const canSeeItem =
          (item.permission && userPerms.includes(item.permission)) ||
          (!item.permission && visibleSubItems.length > 0) ||
          (!item.permission && !item.subItems);

        if (!canSeeItem) return null;

        return {
          ...item,
          ...(visibleSubItems.length > 0 ? { subItems: visibleSubItems } : {}),
        };
      })
      .filter(Boolean) as NavItem[];

    // Agregar dinámicamente las áreas a los menús que las necesitan
    const updatedMenu = filteredMenu.map((item) => {
      if (item.name === "Calificar Competidores") {
        return { ...item, subItems: userAreas.length > 0 ? userAreas : item.subItems };
      }
      if (item.name === "Editar Umbral") {
        return {
          ...item,
          subItems:
            userAreas.length > 0
              ? userAreas.map((area) => {
                  const olympiadId = area.path.split("/")[2]; 
                  return {
                    id: area.id,
                    name: area.name,
                    path: `/editar-umbral/${olympiadId}/${area.id}/${area.name.toLowerCase()}`,
                  };
                })
              : item.subItems,
        };
      }
      return item;
    });

    setMenuItems(updatedMenu);
  }, [userPerms, userAreas]);

  

//Editar


const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      // className={`py-8 flex justify-center`}
      >
        <Link to="/" className="flex justify-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/ohSansi.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <div>
              <img
                src="/images/logo/ohSansi.svg"
                alt="Logo"
                width={50}
                height={50}
              />
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(menuItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
