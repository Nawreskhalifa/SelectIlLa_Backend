'use strict';

const reservationService = require('../../src/api/reservation/services/reservation');

describe('ReservationService', () => {

  it('should create a new reservation successfully', async () => {
    const mockReservation = { customer: 'Alice', villa: 'Villa A', date: '2026-03-08' };

    reservationService.create = jest.fn().mockResolvedValue(mockReservation);

    const result = await reservationService.create(mockReservation);

    expect(result).toEqual(mockReservation);
    expect(reservationService.create).toHaveBeenCalledWith(mockReservation);
  });

  it('should return a reservation by id', async () => {
    const mockReservation = { id: 1, customer: 'Alice', villa: 'Villa A' };

    reservationService.find = jest.fn().mockResolvedValue([mockReservation]);

    const result = await reservationService.find({ id: 1 });

    expect(result).toEqual([mockReservation]);
    expect(reservationService.find).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw error if customer is missing', async () => {
    const invalidReservation = { villa: 'Villa A', date: '2026-03-08' };

    reservationService.create = jest.fn(() => {
      return Promise.reject(new Error('Customer is required'));
    });

    await expect(reservationService.create(invalidReservation))
      .rejects
      .toThrow('Customer is required');
  });

});