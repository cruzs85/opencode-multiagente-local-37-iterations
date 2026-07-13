import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { Route, CreateRouteDto } from '../models/route.model';

/** Nombre de la base de datos IndexedDB. */
const DB_NAME = 'route-tracker-db';
/** Versión actual del esquema. */
const DB_VERSION = 1;
/** Nombre del object store de rutas. */
const STORE_ROUTES = 'routes';

/**
 * Abstracción sobre IndexedDB usando la librería `idb`.
 * Expone operaciones CRUD asíncronas (Promise-based) para la entidad Route.
 *
 * Se registra como servicio de raíz (providedIn: 'root') por lo que existe
 * una única instancia durante toda la vida de la aplicación.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** Promesa que resuelve con la instancia de la BD, inicializada en el constructor. */
  private readonly dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_ROUTES)) {
          // keyPath 'id' + autoIncrement: IndexedDB genera el id automáticamente.
          db.createObjectStore(STORE_ROUTES, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });
  }

  /**
   * Persiste una nueva ruta y devuelve la ruta con el `id` asignado por IndexedDB.
   */
  async saveRoute(route: CreateRouteDto): Promise<Route> {
    const db = await this.dbPromise;
    const id = (await db.add(STORE_ROUTES, route)) as number;
    return { ...route, id };
  }

  /**
   * Recupera todas las rutas almacenadas, ordenadas por `createdAt` descendente.
   */
  async getAllRoutes(): Promise<Route[]> {
    const db = await this.dbPromise;
    const routes = (await db.getAll(STORE_ROUTES)) as Route[];
    return routes.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Recupera una ruta por su id. Devuelve `undefined` si no existe.
   */
  async getRoute(id: number): Promise<Route | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_ROUTES, id) as Promise<Route | undefined>;
  }

  /**
   * Actualiza una ruta existente. La ruta debe tener `id` definido.
   */
  async updateRoute(route: Route): Promise<void> {
    if (route.id === undefined) {
      throw new Error('StorageService.updateRoute: route must have an id');
    }
    const db = await this.dbPromise;
    await db.put(STORE_ROUTES, route);
  }

  /**
   * Elimina la ruta con el id indicado.
   */
  async deleteRoute(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_ROUTES, id);
  }

  /**
   * Elimina **todas** las rutas. Útil para tests o reset de la aplicación.
   */
  async clearAllRoutes(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_ROUTES);
  }
}
