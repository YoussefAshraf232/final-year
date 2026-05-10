import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  productSchema,
  registerSchema,
  salesInvoiceSchema,
} from '../validators';

describe('loginSchema', () => {
  it('accepts valid input', () => {
    expect(
      loginSchema.safeParse({ identifier: 'a@b.com', password: '123456' }).success
    ).toBe(true);
  });

  it('rejects short password', () => {
    expect(loginSchema.safeParse({ identifier: 'a@b.com', password: '12' }).success).toBe(
      false
    );
  });

  it('accepts username login', () => {
    expect(loginSchema.safeParse({ identifier: 'employee', password: '123456' }).success).toBe(
      true
    );
  });
});

describe('productSchema', () => {
  const validProduct = {
    name: 'X',
    description: 'Y',
    currentPrice: 1,
    categoryIds: [1],
    supplierId: 1,
  };

  it('rejects negative price', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      currentPrice: -1,
    });

    expect(result.success).toBe(false);
  });

  it('accepts an allowed HTTPS image URL', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      pictureUrl: 'https://images.unsplash.com/photo.jpg',
    });

    expect(result.success).toBe(true);
  });

  it('rejects malicious image url', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      pictureUrl: 'http://attacker.com/x.png',
    });

    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('does not accept a role from public registration', () => {
    const result = registerSchema.safeParse({
      username: 'employee',
      email: 'employee@example.com',
      password: '123456',
      role: 'ADMIN',
    });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected registration to pass');
    expect('role' in result.data).toBe(false);
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
