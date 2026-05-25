import { Observable } from 'rxjs';

interface InventoryGrpcService {
  findByProductId(data: { productId: string }): Observable<InventoryResponse>;
  reserve(data: {
    productId: string;
    quantity: number;
  }): Observable<InventoryResponse>;
  release(data: {
    productId: string;
    quantity: number;
  }): Observable<InventoryResponse>;
  confirm(data: {
    productId: string;
    quantity: number;
  }): Observable<InventoryResponse>;
}

interface InventoryResponse {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export type { InventoryGrpcService, InventoryResponse };
