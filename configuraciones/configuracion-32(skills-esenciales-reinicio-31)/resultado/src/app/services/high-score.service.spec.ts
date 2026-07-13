import { TestBed } from '@angular/core/testing';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  let service: HighScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 0 when no high score in localStorage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    
    const highScore = service.getHighScore();
    
    expect(highScore).toBe(0);
    expect(getItemSpy).toHaveBeenCalledWith('dino-runner-high-score');
    getItemSpy.mockRestore();
  });

  it('should return high score from localStorage when exists', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('150');
    
    const highScore = service.getHighScore();
    
    expect(highScore).toBe(150);
    expect(getItemSpy).toHaveBeenCalledWith('dino-runner-high-score');
    getItemSpy.mockRestore();
  });

  it('should set high score in localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    service.setHighScore(200);
    
    expect(setItemSpy).toHaveBeenCalledWith('dino-runner-high-score', '200');
    setItemSpy.mockRestore();
  });

  it('should update highScore signal when setting high score', () => {
    // Primero reseteamos con un valor bajo para que pueda ser actualizado
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    
    // Creamos el servicio como si fuera la primera vez que se inicia
    const newService = TestBed.inject(HighScoreService);
    expect(newService.highScore()).toBe(100);
    
    // Ahora seteamos uno nuevo y verificamos que se actualizará correctamente
    service.setHighScore(200);
    
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
    
    // Creamos otro servicio para ver el nuevo valor
    const updatedService = TestBed.inject(HighScoreService);
    expect(updatedService.highScore()).toBe(200);
  });
});
