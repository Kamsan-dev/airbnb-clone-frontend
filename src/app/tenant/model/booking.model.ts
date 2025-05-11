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
