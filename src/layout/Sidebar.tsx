import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { getUser, getUserAreas, getRoleName } from "../api/services/authService";
import { UPermission } from "../types/enums/UPermissions";
import { ListIcon, ChevronDownIcon, HorizontaLDots, GridIcon, GroupIcon, UserIcon, Slider, PencilIcon, HomeIcon, CheckLineIcon, Medal, TrashBinIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useOlympiad } from "../context/OlympiadContext";
import { Phase } from "../types/Phase";
import { getOlympiadPhases } from "../api/services/phaseService";


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
    UPermission.EDIT_SCORE_CUT,
    UPermission.FILTER_COMPETITOR_BY_AREA,
    UPermission.APPROVE_PHASE,
    UPermission.RANKED_CONTESTANTS_LIST,
    UPermission.AWARDED_CONTESTANTS_LIST,
    UPermission.MEDAL_PAGE,
    UPermission.DISQUALIFY_COMPETITOR,
  ],
  3: [ // Evaluador
    UPermission.GRADE_COMPETITOR,
    UPermission.FILTER_COMPETITOR_BY_AREA,
    UPermission.RANKED_CONTESTANTS_LIST,
    UPermission.DISQUALIFY_COMPETITOR,
  ],
};

const navItems: NavItem[] = [
  {
    icon: <HomeIcon />,
    name: "Inicio",
    path: "/seleccionar-olimpiada",
  },
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
    icon: <TrashBinIcon />,
    name: "Descalificar Competidor",
    path: "/descalificar-competidor",
    subItems: [],
    permission: UPermission.DISQUALIFY_COMPETITOR,
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
  {
    icon: <CheckLineIcon />,
    name: "Avalar Fase",
    path: "/aprobar-fase",
    subItems: [],
    permission: UPermission.APPROVE_PHASE,
  },
  {
    icon: <Medal />,
    name: "Medallero",
    path: "/medallero",
    permission: UPermission.MEDAL_PAGE,
  },
  {
    icon: <ListIcon />,
    name: "Lista de Clasificados",
    path: "/lista-competidores-clasificados",
    subItems: [],
    permission: UPermission.RANKED_CONTESTANTS_LIST,
  },
  {
    icon: <ListIcon />,
    name: "Lista de Premiados",
    path: "/lista-competidores-premiados",
    subItems: [],
    permission: UPermission.AWARDED_CONTESTANTS_LIST,
  },

];
const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const user = getUser();
  const roleNames = getRoleName(user);
  const isAdmin = roleNames[0] === "Admin";
  const userPerms = useMemo(() => {
    if (!user || !Array.isArray(user.roles_id)) return [] as UPermission[];
    return [...new Set(user.roles_id.flatMap((role: any) => rolePermissions[role.id] || []))];
  }, [user?.roles_id?.map((r: any) => r.id).join(",")]);

  const { selectedOlympiad } = useOlympiad();
  const [userAreas, setUserAreas] = useState<{ id: number; name: string; path: string }[]>([]);
  const [menuItems, setMenuItems] = useState(navItems);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [openAreaId, setOpenAreaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAreas = async (olympiadId: number) => {
      try {
        const res = await getUserAreas(olympiadId);
        console.log("Respuesta de getUserAreas:", res);
        const formatted = res.areas.map((area) => ({
          id: area.id,
          name: area.name,
          path: `/calificaciones/${olympiadId}/${encodeURIComponent(area.name)}/${area.id}`,

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

  // obtener fases de la olimpiada
  useEffect(() => {
    const fetchPhases = async (olympiadId: number) => {
      try {
        const data = await getOlympiadPhases(olympiadId);
        setPhases(data);
      } catch (error) {
        console.error("Error obteniendo fases:", error);
      }
    };

    if (selectedOlympiad?.id) {
      fetchPhases(selectedOlympiad.id);
    }
  }, [selectedOlympiad]);


  useEffect(() => {
    // Solo actualizamos si ya tenemos las áreas
    if (userAreas.length > 0) {
      const updated = navItems.map((item) => {
        if (item.name === "Calificar Competidores") {
          // construir subitems por área que contengan las fases
          const areasWithPhases = userAreas.map((area) => {
            const areaSubItems = phases.length
              ? phases.map((p) => {
                console.log(p.name);
                return {
                  name: p.name,
                  path: `${area.path}/${encodeURIComponent(p.name)}/${p.id}`,

                };
              })
              : [];

            return {
              id: area.id,
              name: area.name,
              path: area.path,
              subItems: areaSubItems,
            };
          });

          return { ...item, subItems: areasWithPhases };
        }
        return item;
      });
      setMenuItems(updated);
    } else {
      setMenuItems(navItems);
    }
  }, [userAreas, phases]);

  const toggleArea = (areaId: number) => {
    setOpenAreaId((prev) => (prev === areaId ? null : areaId));
  };

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

        // Ajustar dinámicamente la ruta de "Inicio" según el rol
        const adjustedItem =
          item.name === "Inicio"
            ? { ...item, path: isAdmin ? "/" : "/seleccionar-olimpiada" }
            : item;

        return {
          ...adjustedItem,
          ...(visibleSubItems.length > 0 ? { subItems: visibleSubItems } : {}),
        };
      })
      .filter(Boolean) as NavItem[];

    // Agregar dinámicamente las áreas a los menús que las necesitan
    const updatedMenu = filteredMenu.map((item) => {
      if (item.name === "Calificar Competidores") {
        if (userAreas.length > 0) {
          const areasWithPhases = userAreas.map((area) => {
            const areaSubItems = phases.length
              ? phases.map((p) => ({
                name: p.name,
                path: `${area.path}/${p.name}/${p.id}`,

              }))
              : [];

            return {
              id: area.id,
              name: area.name,
              path: area.path,
              subItems: areaSubItems,
            };
          });

          return { ...item, subItems: areasWithPhases };
        }
        return { ...item, subItems: item.subItems };
      }
      if (item.name === "Editar Umbral") {
        if (userAreas.length > 0) {
          const areasWithPhases = userAreas.map((area) => {
            const olympiadId = area.path.split("/")[2];

            const areaSubItems = phases.length
              ? phases.map((phase) => ({
                name: phase.name,
                path: `/editar-umbral/${olympiadId}/${encodeURIComponent(
                  area.name
                )}/${area.id}/${encodeURIComponent(phase.name)}/${phase.id}`,
              }))
              : [];

            return {
              id: area.id,
              name: area.name,
              path: `/editar-umbral/${olympiadId}/${encodeURIComponent(
                area.name
              )}/${area.id}`,
              subItems: areaSubItems,
            };
          });

          return { ...item, subItems: areasWithPhases };
        }
        return { ...item, subItems: item.subItems };
      }
      if (item.name === "Descalificar Competidor") {
        if (userAreas.length > 0) {
          const areasWithPhases = userAreas.map((area) => {
            const olympiadId = area.path.split("/")[2];

            const areaSubItems = phases.length
              ? phases.map((phase) => ({
                name: phase.name,
                path: `/descalificar-competidor/${olympiadId}/${encodeURIComponent(
                  area.name
                )}/${area.id}/${encodeURIComponent(phase.name)}/${phase.id}`,
              }))
              : [];

            return {
              id: area.id,
              name: area.name,
              path: `/descalificar-competidor/${olympiadId}/${encodeURIComponent(
                area.name
              )}/${area.id}`,
              subItems: areaSubItems,
            };
          });

          return { ...item, subItems: areasWithPhases };
        }
        return { ...item, subItems: item.subItems };
      }

      if (item.name === "Avalar Fase") {
        if (userAreas.length > 0) {
          const areasWithPhases = userAreas.map((area) => {
            const olympiadId = area.path.split("/")[2];

            const areaSubItems = phases.length
              ? phases.map((phase) => ({
                name: phase.name,
                path: `/aprobar-fase/${olympiadId}/${encodeURIComponent(
                  area.name
                )}/${area.id}/${encodeURIComponent(phase.name)}/${phase.id}`,
              }))
              : [];

            return {
              id: area.id,
              name: area.name,
              path: `/aprobar-fase/${olympiadId}/${encodeURIComponent(
                area.name
              )}/${area.id}`,
              subItems: areaSubItems,
            };
          });

          return { ...item, subItems: areasWithPhases };
        }
        return { ...item, subItems: item.subItems };
      }
      if (item.name === "Lista de Clasificados") {
        if (userAreas.length > 0) {
          const areasWithPhases = userAreas.map((area) => {
            const olympiadId = area.path.split("/")[2];

            const areaSubItems = phases.length
              ? phases.map((phase) => ({
                name: phase.name,
                path: `/lista-competidores-clasificados/${olympiadId}/${encodeURIComponent(
                  area.name
                )}/${area.id}/${encodeURIComponent(phase.name)}/${phase.id}`,
              }))
              : [];

            return {
              id: area.id,
              name: area.name,
              path: `/lista-competidores-clasificados/${olympiadId}/${encodeURIComponent(
                area.name
              )}/${area.id}`,
              subItems: areaSubItems,
            };
          });

          return { ...item, subItems: areasWithPhases };
        }
        return { ...item, subItems: item.subItems };
      }

      if (item.name === "Lista de Premiados") {
        if (userAreas.length > 0) {
          const areasOnly = userAreas.map((area) => {
            const olympiadId = area.path.split("/")[2];

            return {
              id: area.id,
              name: area.name,
              path: `/lista-competidores-premiados/${olympiadId}/${encodeURIComponent(
                area.name
              )}/${area.id}`
            };
          });

          return { ...item, subItems: areasOnly };
        }

        return { ...item, subItems: item.subItems };
      }

      if (item.name === "Filtrar lista de Competidores") {
        if (selectedOlympiad?.id) {
          return {
            ...item,
            path: `/filtros-de-lista/${selectedOlympiad.id}`,
          };
        }
      }
      return item;
    });

    setMenuItems(updatedMenu);
  }, [userPerms, userAreas, phases]);



  //Editar


  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number | 'auto'>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevOpenSubmenuRef = useRef<typeof openSubmenu | null>(null);

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

  // Manejo refinado de expand/collapse para animaciones correctas
  useEffect(() => {
    const prev = prevOpenSubmenuRef.current;
    // Si antes había un submenu abierto y ahora se cerró -> animar colapso
    if (prev && openSubmenu === null) {
      const prevKey = `${prev.type}-${prev.index}`;
      const el = subMenuRefs.current[prevKey];
      if (el) {
        // fijar la altura actual y luego animar a 0
        const h = el.scrollHeight || 0;
        setSubMenuHeight((prevHeights) => ({ ...prevHeights, [prevKey]: h }));
        // dar tiempo a que se aplique y luego colapsar
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            setSubMenuHeight((prevHeights) => ({ ...prevHeights, [prevKey]: 0 }));
          }, 0);
        });
      }
    }

    // Si ahora hay un submenu abierto -> expandir y luego poner 'auto'
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      if (el) {
        const h = el.scrollHeight || 0;
        setSubMenuHeight((prevHeights) => ({ ...prevHeights, [key]: h }));
        const tid = setTimeout(() => {
          setSubMenuHeight((prevHeights) => ({ ...prevHeights, [key]: 'auto' }));
        }, 160); // ligeramente mayor que la duración CSS (150ms)
        return () => clearTimeout(tid);
      }
    }

    prevOpenSubmenuRef.current = openSubmenu;
  }, [openSubmenu]);

  // Recalcular altura del submenú abierto cuando cambian las fases o el contenido del menú
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      if (el) {
        // Esperar al siguiente frame (y un micro delay) para que el DOM aplique "hidden/block"
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            const h = el.scrollHeight || 0;
            setSubMenuHeight((prev) => ({ ...prev, [key]: h }));
            const tid = setTimeout(() => {
              setSubMenuHeight((prev) => ({ ...prev, [key]: 'auto' }));
            }, 160);
            // limpieza si el effect se re-ejecuta
            return () => clearTimeout(tid);
          }, 0);
        });
      }
    }
  }, [phases, menuItems, openSubmenu, openAreaId]);

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
              className={`overflow-hidden transition-all ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "duration-150"
                : "duration-0"
                }`}
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? (subMenuHeight[`${menuType}-${index}`] === 'auto'
                      ? 'auto'
                      : `${subMenuHeight[`${menuType}-${index}`] || 0}px`)
                    : '0px',
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    {/* Si el subItem trae subItems (área con fases) renderizamos boton que expande las fases */}
                    {(
                      (subItem as any).subItems && (subItem as any).subItems.length > 0
                    ) ? (
                      <div>
                        <button
                          onClick={() => toggleArea((subItem as any).id)}
                          className={`menu-dropdown-item group ${openAreaId === (subItem as any).id
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                            } w-full text-left flex items-center gap-2`}
                        >
                          <span>{subItem.name}</span>
                          <ChevronDownIcon
                            className={`ml-auto w-4 h-4 transition-transform duration-200 ${openAreaId === (subItem as any).id ? "rotate-180 text-brand-500" : ""}`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-150 ${openAreaId === (subItem as any).id ? "mt-2" : "h-0"}`}
                        >
                          <ul className={`ml-4 space-y-1 ${openAreaId === (subItem as any).id ? "block" : "hidden"}`}>
                            {((subItem as any).subItems as Array<any>).map((phase: any) => (
                              <li key={phase.name}>
                                <Link
                                  to={phase.path}
                                  className={`menu-dropdown-item ${isActive(phase.path)
                                    ? "menu-dropdown-item-active"
                                    : "menu-dropdown-item-inactive"
                                    }`}
                                >
                                  {phase.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
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
                    )}
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
