"use strict";

const villaServiceFactory = require("../../src/api/villa/services/villa");

describe("Villa Service", () => {
  let strapi;
  let service;

  beforeEach(() => {
    strapi = {
      entityService: {
        create: jest.fn().mockResolvedValue({
          id: 1,
          name: "Villa Test",
        }),

        update: jest.fn().mockResolvedValue({
          id: 1,
          available: false,
        }),

        findOne: jest.fn().mockResolvedValue({
          id: 1,
          name: "Villa Test",
        }),
      },
    };

    service = villaServiceFactory({ strapi });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE
  // =========================
  it("should create a villa", async () => {
    const data = {
      name: "Villa Test",
      available: true,
    };

    const result = await service.create(data);

    expect(strapi.entityService.create).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      name: "Villa Test",
    });
  });

  // =========================
  // UPDATE
  // =========================
  it("should update a villa", async () => {
    const data = {
      id: 1,
      available: false,
    };

    const result = await service.update(data);

    expect(strapi.entityService.update).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      available: false,
    });
  });

  // =========================
  // FIND ONE
  // =========================
  it("should find one villa", async () => {
    const result = await service.findOne(1);

    expect(strapi.entityService.findOne).toHaveBeenCalledWith(
      "api::villa.villa",
      1
    );

    expect(result).toEqual({
      id: 1,
      name: "Villa Test",
    });
  });
});