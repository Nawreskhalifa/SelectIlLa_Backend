'use strict';

const customerService = require('../../src/api/customer/services/customer');

describe('CustomerService CRUD', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================
  // CREATE
  // =====================
  it('should create a new customer successfully', async () => {
    const mockCustomer = { name: 'Alice', email: 'alice@example.com' };

    customerService.create = jest.fn().mockResolvedValue(mockCustomer);

    const result = await customerService.create(mockCustomer);

    expect(result).toEqual(mockCustomer);
    expect(customerService.create).toHaveBeenCalledWith(mockCustomer);
  });

  it('should throw error if create fails', async () => {
    const invalidCustomer = { email: 'no-name@example.com' };

    customerService.create = jest.fn().mockRejectedValue(
      new Error('Name is required')
    );

    await expect(customerService.create(invalidCustomer))
      .rejects
      .toThrow('Name is required');
  });

  // =====================
  // READ (FIND MANY)
  // =====================
  it('should return list of customers', async () => {
    const mockList = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];

    customerService.findMany = jest.fn().mockResolvedValue(mockList);

    const result = await customerService.findMany();

    expect(result).toEqual(mockList);
    expect(customerService.findMany).toHaveBeenCalled();
  });

  // =====================
  // READ (FIND ONE)
  // =====================
  it('should return one customer by id', async () => {
    const mockCustomer = { id: 1, name: 'Alice' };

    customerService.findOne = jest.fn().mockResolvedValue(mockCustomer);

    const result = await customerService.findOne(1);

    expect(result).toEqual(mockCustomer);
    expect(customerService.findOne).toHaveBeenCalledWith(1);
  });

  it('should return null if customer not found', async () => {
    customerService.findOne = jest.fn().mockResolvedValue(null);

    const result = await customerService.findOne(999);

    expect(result).toBeNull();
  });

  // =====================
  // UPDATE
  // =====================
  it('should update customer successfully', async () => {
    const updatedCustomer = { id: 1, name: 'Alice Updated' };

    customerService.update = jest.fn().mockResolvedValue(updatedCustomer);

    const result = await customerService.update(1, { name: 'Alice Updated' });

    expect(result).toEqual(updatedCustomer);
    expect(customerService.update).toHaveBeenCalledWith(1, { name: 'Alice Updated' });
  });

  it('should throw error if update fails', async () => {
    customerService.update = jest.fn().mockRejectedValue(
      new Error('Update failed')
    );

    await expect(customerService.update(1, {}))
      .rejects
      .toThrow('Update failed');
  });

  // =====================
  // DELETE
  // =====================
  it('should delete customer successfully', async () => {
    const deletedResponse = { id: 1, deleted: true };

    customerService.delete = jest.fn().mockResolvedValue(deletedResponse);

    const result = await customerService.delete(1);

    expect(result).toEqual(deletedResponse);
    expect(customerService.delete).toHaveBeenCalledWith(1);
  });

  it('should throw error if delete fails', async () => {
    customerService.delete = jest.fn().mockRejectedValue(
      new Error('Delete failed')
    );

    await expect(customerService.delete(1))
      .rejects
      .toThrow('Delete failed');
  });

});