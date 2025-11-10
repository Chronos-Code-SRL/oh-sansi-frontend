export interface LevelOption {
  id: number;
  name: string;
}export interface Datum {
  message: string;
  data: LevelOption[];
  status: number;
}
