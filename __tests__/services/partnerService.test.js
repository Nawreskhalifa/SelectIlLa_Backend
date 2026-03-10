'use strict';

const partnerService = require('../../src/api/partner/services/partner');

describe('PartnerService', () => {

  it('should create a new partner successfully', async () => {
    const mockPartner = { name: 'Partner A', email: 'partner@example.com' };

    // Mock de create()
    partnerService.create = jest.fn().mockResolvedValue(mockPartner);

    const result = await partnerService.create(mockPartner);

    expect(result).toEqual(mockPartner);
    expect(partnerService.create).toHaveBeenCalledWith(mockPartner);
  });

  it('should return a partner by id', async () => {
    const mockPartner = { id: 1, name: 'Partner A' };

    partnerService.find = jest.fn().mockResolvedValue([mockPartner]);

    const result = await partnerService.find({ id: 1 });

    expect(result).toEqual([mockPartner]);
    expect(partnerService.find).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw error if name is missing', async () => {
    const invalidPartner = { email: 'no-name@example.com' };

    partnerService.create = jest.fn(() => {
      return Promise.reject(new Error('Name is required'));
    });

    await expect(partnerService.create(invalidPartner))
      .rejects
      .toThrow('Name is required');
  });

});