export interface Video {
    _id: string;
    originalName: string;
    status: "uploaded" | "processing" | "safe" | "flagged";
    sensitivityScore?: number;
  }
  