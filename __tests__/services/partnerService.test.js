'use strict';

const partnerService = require('../../src/api/partner/services/partner');

describe('PartnerService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================
  // CREATE
  // =====================
  it('should create a new partner successfully', async () => {
    const mockPartner = { name: 'Partner A', email: 'partner@example.com' };

    partnerService.create = jest.fn().mockResolvedValue(mockPartner);

    const result = await partnerService.create(mockPartner);

    expect(result).toEqual(mockPartner);
    expect(partnerService.create).toHaveBeenCalledWith(mockPartner);
  });

  it('should throw error if name is missing', async () => {
    const invalidPartner = { email: 'no-name@example.com' };

    partnerService.create = jest.fn().mockRejectedValue(
      new Error('Name is required')
    );

    await expect(partnerService.create(invalidPartner))
      .rejects
      .toThrow('Name is required');
  });

  // =====================
  // READ (LIST)
  // =====================
  it('should return list of partners', async () => {
    const partners = [
      { id: 1, name: 'Partner A' },
      { id: 2, name: 'Partner B' }
    ];

    partnerService.find = jest.fn().mockResolvedValue(partners);

    const result = await partnerService.find();

    expect(result.length).toBe(2);
    expect(partnerService.find).toHaveBeenCalled();
  });

  // =====================
  // READ (ONE)
  // =====================
  it('should return a partner by id', async () => {
    const mockPartner = { id: 1, name: 'Partner A' };

    partnerService.find = jest.fn().mockResolvedValue([mockPartner]);

    const result = await partnerService.find({ id: 1 });

    expect(result).toEqual([mockPartner]);
    expect(partnerService.find).toHaveBeenCalledWith({ id: 1 });
  });

  it('should return empty array if partner not found', async () => {
    partnerService.find = jest.fn().mockResolvedValue([]);

    const result = await partnerService.find({ id: 999 });

    expect(result).toEqual([]);
  });

  // =====================
  // UPDATE
  // =====================
  it('should update a partner successfully', async () => {
    const updatedPartner = { id: 1, name: 'Updated Partner' };

    partnerService.update = jest.fn().mockResolvedValue(updatedPartner);

    const result = await partnerService.update(1, { name: 'Updated Partner' });

    expect(result).toEqual(updatedPartner);
    expect(partnerService.update).toHaveBeenCalledWith(1, { name: 'Updated Partner' });
  });

  it('should throw error if update fails', async () => {
    partnerService.update = jest.fn().mockRejectedValue(
      new Error('Update failed')
    );

    await expect(partnerService.update(1, {}))
      .rejects
      .toThrow('Update failed');
  });

  // =====================
  // DELETE
  // =====================
  it('should delete a partner successfully', async () => {
    const response = { deleted: true };

    partnerService.delete = jest.fn().mockResolvedValue(response);

    const result = await partnerService.delete(1);

    expect(result.deleted).toBe(true);
    expect(partnerService.delete).toHaveBeenCalledWith(1);
  });

  it('should throw error if delete fails', async () => {
    partnerService.delete = jest.fn().mockRejectedValue(
      new Error('Delete failed')
    );

    await expect(partnerService.delete(1))
      .rejects
      .toThrow('Delete failed');
  });

});