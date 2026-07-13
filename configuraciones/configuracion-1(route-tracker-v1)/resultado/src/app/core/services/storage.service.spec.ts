import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Route, CreateRouteDto } from '../models/route.model';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveRoute', () => {
    it('should have a saveRoute method', () => {
      expect(typeof service.saveRoute).toBe('function');
    });

    it('should accept CreateRouteDto parameters', () => {
      const routeDto: CreateRouteDto = {
        name: 'Test Route',
        points: [{ lat: 40.4168, lng: -3.7038 }],
        createdAt: Date.now(),
        distanceMeters: 1000,
      };
      
      // Just test that the method exists and accepts the right parameters
      expect(() => service.saveRoute(routeDto)).not.toThrow();
    });
  });

  describe('getAllRoutes', () => {
    it('should have a getAllRoutes method', () => {
      expect(typeof service.getAllRoutes).toBe('function');
    });

    it('should return a promise', () => {
      const result = service.getAllRoutes();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getRoute', () => {
    it('should have a getRoute method', () => {
      expect(typeof service.getRoute).toBe('function');
    });

    it('should accept a number id parameter', () => {
      const result = service.getRoute(1);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('updateRoute', () => {
    it('should have an updateRoute method', () => {
      expect(typeof service.updateRoute).toBe('function');
    });

    it('should require route with id', () => {
      const route: Route = {
        id: 1,
        name: 'Test Route',
        points: [{ lat: 40.4168, lng: -3.7038 }],
        createdAt: Date.now(),
        distanceMeters: 1000,
      };
      
      expect(() => service.updateRoute(route)).not.toThrow();
    });
  });

  describe('deleteRoute', () => {
    it('should have a deleteRoute method', () => {
      expect(typeof service.deleteRoute).toBe('function');
    });

    it('should accept a number id parameter', () => {
      const result = service.deleteRoute(1);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('clearAllRoutes', () => {
    it('should have a clearAllRoutes method', () => {
      expect(typeof service.clearAllRoutes).toBe('function');
    });

    it('should return a promise', () => {
      const result = service.clearAllRoutes();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('error handling', () => {
    it('should throw error when updateRoute is called without id', async () => {
      const routeWithoutId: Route = {
        id: undefined,
        name: 'Route without id',
        points: [{ lat: 40.4168, lng: -3.7038 }],
        createdAt: Date.now(),
        distanceMeters: 1000,
      };

      await expect(service.updateRoute(routeWithoutId)).rejects.toThrow(
        'StorageService.updateRoute: route must have an id'
      );
    });
  });
});