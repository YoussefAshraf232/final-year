import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  productSchema,
  salesInvoiceSchema,
} from '../validators';

describe('loginSchema', () => {
  it('accepts valid input', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.com', password: '123456' }).success
    ).toBe(true);
  });

  it('rejects short password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '12' }).success).toBe(
      false
    );
  });

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: '123456' }).success).toBe(
      false
    );
  });
});

describe('productSchema', () => {
  it('rejects negative price', () => {
    const result = productSchema.safeParse({
      name: 'X',
      description: 'Y',
      currentPrice: -1,
      categoryId: 1,
      supplierId: 1,
    });

    expect(result.success).toBe(false);
  });

  it('accepts an allowed HTTPS image URL', () => {
    const result = productSchema.safeParse({
      name: 'X',
      description: 'Y',
      photo: 'https://images.unsplash.com/photo.jpg',
      currentPrice: 1,
      categoryId: 1,
      supplierId: 1,
    });

    expect(result.success).toBe(true);
  });

  it('rejects malicious image url', () => {
    const result = productSchema.safeParse({
      name: 'X',
      description: 'Y',
      photo: 'http://attacker.com/x.png',
      currentPrice: 1,
      categoryId: 1,
      supplierId: 1,
    });

    expect(result.success).toBe(false);
  });
});

describe('salesInvoiceSchema', () => {
  it('requires at least one item', () => {
    const result = salesInvoiceSchema.safeParse({
      customerId: 1,
      warehouseId: 1,
      discount: 0,
      items: [],
    });

    expect(result.success).toBe(false);
  });
});
