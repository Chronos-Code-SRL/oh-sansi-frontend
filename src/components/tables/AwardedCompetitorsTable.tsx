import { useEffect, useState } from "react";
import { getAwardWinningCompetitors } from "../../api/services/contestantService";
import { AwardWinningCompetitors } from "../../types/Contestant";
import { Table, TableBody, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Props {
  idOlympiad: number;
  idArea: number;
}

export default function AwardedTable({ idOlympiad, idArea }: Props) {
  const [rows, setRows] = useState<AwardWinningCompetitors[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAwarded() {
        try {
        setLoading(true);

        const data = await getAwardWinningCompetitors(idOlympiad, idArea);
        console.log("📌 Awarded API data (array):", data);

        // Normalizar propiedades
        const normalized = data.map((item: any) => ({
            first_name: item.first_name ?? item.firstName ?? "",
            last_name: item.last_name ?? item.lastName ?? "",
            department: item.department ?? item.depto ?? "",
            level_name: item.level_name ?? item.levelName ?? item.level ?? "",
            area_name: item.area_name ?? item.areaName ?? item.area ?? "",
            classification_place:
            item.classification_place ?? item.classificationPlace ?? null,
        }));

        console.log("🔍 Normalized:", normalized);

        setRows(normalized);

        } catch (err) {
        console.error(err);
        setError("Error al cargar los ganadores.");
        setRows([]);
        } finally {
        setLoading(false);
        }
    }

    if (Number(idOlympiad) > 0 && Number(idArea) > 0) {
        loadAwarded();
    }
    }, [idOlympiad, idArea]);



  // 🔥 Nueva versión tolerante a null
  const getColorByMedal = (
    place: AwardWinningCompetitors["classification_place"] | null
  ) => {
    if (!place) return "neutral"; // Valor seguro si viene null

    switch (place) {
      case "Oro":
        return "success";
      case "Plata":
        return "info";
      case "Bronce":
        return "warning";
      case "Mención de Honor":
        return "neutral";
      default:
        return "neutral";
    }
  };

  if (loading) return <p>Cargando datos…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="mx-auto w-full space-y-4">
      <h2 className="block text-left text-lg font-semibold mb-3">
        Competidores Ganadores
      </h2>

      <div className="mt-6 overflow-x-auto rounded-xl">
        <Table className="min-w-full border border-gray-200 text-sm text-center">
          <TableHeader className="bg-gray-100 border-b border-border bg-muted/50">
            <TableRow>
              <th className="px-5 py-4 text-sm font-semibold">Nombre</th>
              <th className="px-5 py-4 text-sm font-semibold">Apellido</th>
              <th className="px-5 py-4 text-sm font-semibold">Departamento</th>
              <th className="px-5 py-4 text-sm font-semibold">Nivel</th>
              <th className="px-5 py-4 text-sm font-semibold">Área</th>
              <th className="px-5 py-4 text-sm font-semibold">Lugar</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500">
                  No hay ganadores registrados.
                </td>
              </tr>
            ) : (
              rows.map((c, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-gray-50 border-b border-border last:border-0"
                >
                  <td className="px-5 py-4">{c.first_name}</td>
                  <td className="px-5 py-4">{c.last_name}</td>
                  <td className="px-5 py-4">{c.department}</td>
                  <td className="px-5 py-4">{c.level_name}</td>
                  <td className="px-5 py-4">{c.area_name}</td>

                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <Badge color={getColorByMedal(c.classification_place)}>
                      {/* si viene null, mostrar texto alternativo */}
                      {c.classification_place ?? "Sin clasificación"}
                    </Badge>
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
