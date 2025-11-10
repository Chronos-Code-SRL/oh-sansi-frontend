export interface LevelOption {
  id: number;
  name: string;
}

//selectLevel
export interface Level {
  id: number;
  name: string;
}

export interface LevelResponse {
  levels: Level[];
}
