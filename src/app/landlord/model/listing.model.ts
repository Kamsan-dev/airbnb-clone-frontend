import { CategoryName } from '../../layout/category/category.model';
import { BathsVo, BedroomsVo, BedsVo, DescriptionVo, GuestsVo, PriceVo, TitleVo } from './listing-vo.model';
import { DisplayPicture, NewListingPicture } from './picture.model';

export interface NewListingInfo {
  guests: GuestsVo;
  bedrooms: BedroomsVo;
  beds: BedsVo;
  baths: BathsVo;
}

export interface Description {
  title: TitleVo;
  description: DescriptionVo;
}

export interface newListing {
  category: CategoryName;
  location: string;
  infos: NewListingInfo;
  pictures: Array<NewListingPicture>;
  description: Description;
  price: PriceVo;
}

export interface CreatedListing {
  publicId: string;
}

export interface DisplayCardListing {
  price: PriceVo;
  location: string;
  cover: DisplayPicture;
  bookingCategory: CategoryName;
  publicId: string;
  loading: boolean;
}

export interface Listing {
  category: CategoryName;
  location: string;
  infos: NewListingInfo;
  pictures: Array<DisplayPicture>;
  description: Description;
  price: PriceVo;
  landlord: LandlordListing;
}

export interface LandlordListing {
  firstName: string;
  imageUrl: string;
}
