'use strict';

const partnerService = require('../../src/api/partner/services/partner');

describe('PartnerService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

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
});
