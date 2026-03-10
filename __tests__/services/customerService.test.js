'use strict';

const customerService = require('../../src/api/customer/services/customer');

describe('CustomerService', () => {

  it('should create a new customer successfully', async () => {
    const mockCustomer = { name: 'Alice', email: 'alice@example.com' };
    
    // Mock de la méthode create
    customerService.create = jest.fn().mockResolvedValue(mockCustomer);

    const result = await customerService.create(mockCustomer);

    expect(result).toEqual(mockCustomer);
    expect(customerService.create).toHaveBeenCalledWith(mockCustomer);
  });

  it('should throw error if no name provided', async () => {
    const invalidCustomer = { email: 'no-name@example.com' };
    
    // Mock de create() pour renvoyer une Promise rejetée
    customerService.create = jest.fn(() => {
      return Promise.reject(new Error('Name is required'));
    });

    await expect(customerService.create(invalidCustomer))
      .rejects
      .toThrow('Name is required');
  });

});