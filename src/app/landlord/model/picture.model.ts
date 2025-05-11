export interface NewListingPicture {
  file: File;
  urlDisplay: string;
}

export interface DisplayPicture {
  file?: string;
  fileContentType?: string;
  isCover?: boolean;
}
