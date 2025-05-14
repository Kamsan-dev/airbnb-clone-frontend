import dayjs, { Dayjs } from 'dayjs';
import { PriceVo } from '../../landlord/model/listing-vo.model';
import { DisplayPicture } from '../../landlord/model/picture.model';

export interface BookedListing {
  location: string;
  cover: DisplayPicture;
  totalPrice: PriceVo;
  dates: BookedDatesDTOFromServer;
  bookingPublicId: string;
  listingPublicId: string;
  loading: boolean;
}

export interface BookedDatesDTOFromServer {
  startDate: Date;
  endDate: Date;
}

export interface newBookingListing {
  startDate: Date;
  endDate: Date;
  listingPublicId: string;
}

export interface BookedDatesDTOFromClient {
  startDate: Dayjs;
  endDate: Dayjs;
}

export interface BookedDatesDTOFromServer {
  startDate: Date;
  endDate: Date;
}
