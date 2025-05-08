import { CategoryName } from '../../layout/category/category.model';
import { BathsVo, BedroomsVo, BedsVo, DescriptionVo, GuestsVo, PriceVo, TitleVo } from './listing-vo.model';
import { NewListingPicture } from './picture.model';

export interface NewListingInfo {
  guests: GuestsVo;
  bedrooms: BedroomsVo;
  beds: BedsVo;
  baths: BathsVo;
}

export interface newListing {
  category: CategoryName;
  location: string;
  infos: NewListingInfo;
  pictures: Array<NewListingPicture>;
  description: Description;
  price: PriceVo;
}

export interface Description {
  title: TitleVo;
  description: DescriptionVo;
}

export interface CreatedListing {
  publicId: string;
}
