import type { MarketplaceListing } from '../models/MarketplaceListing';
import type { PaymentResponse } from '../models/PaymentResponse';
import type { PostTicketRequest } from '../models/PostTicketRequest';
import { request as __request } from '../core/request';
import { OpenAPI } from '../core/OpenAPI';
import type { CancelablePromise } from '../core/CancelablePromise';

export class MarketplaceService {
  public static getActiveListings(): CancelablePromise<Array<MarketplaceListing>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/marketplace',
    });
  }

  public static getSellerListings(sellerId: string): CancelablePromise<Array<MarketplaceListing>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/marketplace/seller',
      query: { sellerId },
    });
  }

  public static postListing(requestBody: PostTicketRequest): CancelablePromise<MarketplaceListing> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/marketplace',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static buyListing(listingId: string, buyerId: string): CancelablePromise<PaymentResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/marketplace/{listingId}/buy',
      path: { listingId },
      body: buyerId,
      mediaType: 'application/json',
    });
  }
}
