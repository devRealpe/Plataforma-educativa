import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-motivational-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motivational-messages.component.html',
  styleUrls: ['./motivational-messages.component.scss'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class MotivationalMessagesComponent implements OnInit, OnDestroy {
  @Input() showOnInit = true;
  
  motivationalMessages = [
"Siempre un paso adelante, incluso cuando el camino parece difícil.",
"Si crees en ti mismo, ya has ganado la mitad de la batalla.",
"Confía en el proceso, cada intento te acerca a tu meta.",
"Cada día es una nueva oportunidad para aprender y crecer.",
"No temas equivocarte, es en el error donde más aprendemos.",
"Las mejores lecciones vienen después de un esfuerzo constante.",
"Que los errores no sean más fuertes que tus ganas de seguir.",
"Nunca desistas, cada paso te hace más fuerte.",
"Sé constante y lucha por alcanzar tus sueños.",
"Empieza de nuevo las veces que sean necesarias, el éxito está en la perseverancia.",
"Nunca es tarde para volver a intentarlo y mejorar.",
"Los grandes esfuerzos traen grandes recompensas.",
"Tu esfuerzo de hoy será el éxito de mañana.",
"El aprendizaje es un tesoro que siempre te acompañará.",
"Los sueños no funcionan a menos que pongas esfuerzo en ellos.",
"Una mente abierta es una mente llena de posibilidades.",
"La curiosidad es el motor que impulsa el aprendizaje.",
"El futuro pertenece a quienes creen en la belleza de sus sueños.",
"El esfuerzo que pones hoy construye tu mañana.",
"Nunca permitas que nadie apague tu chispa de curiosidad.",
"Las estrellas están a tu alcance si trabajas para ello.",
"El esfuerzo es el mapa que te guía hacia tus metas.",
"Tu potencial es ilimitado, solo depende de ti descubrirlo.",
"La perseverancia siempre supera al talento.",
"La educación es la llave que abre todas las puertas.",
"Cada minuto de estudio es un paso más hacia tu objetivo.",
"Confía en tu preparación, has trabajado duro para esto.",
"La disciplina es el puente hacia tus sueños.",
"No importa cuántas veces caigas, lo importante es levantarte siempre.",
"La confianza en ti mismo es el primer paso hacia el éxito.",
"El estudio es el mejor antídoto contra el miedo y la incertidumbre.",
"Cada prueba es un peldaño en la escalera de tus logros.",
"No hay atajos para el éxito, solo trabajo constante.",
"La preparación transforma el miedo en confianza.",
"El éxito es la suma de pequeños esfuerzos diarios.",
"Cree en ti mismo, estás más cerca de lo que imaginas.",
"Tu determinación es más fuerte que cualquier obstáculo.",
"Cada página que estudias es un ladrillo en tu futuro.",
"El conocimiento que adquieres ahora te abre muchas puertas.",
"La alegría de aprender es el mejor regalo que puedes darte.",
"No dejes que nadie apague tus ganas de superarte.",
"El esfuerzo sincero vale más que cualquier excusa para rendirse."
  ];

  currentMessageIndex = 0;
  currentMessage = '';
  progressWidth = 100;
  private messageTimeout: any;
  private progressTimeout: any;
  showMotivationalMessages = true;
  private messageDuration = 10000; // 10 segundos
  private startTime: number = 0;

  ngOnInit() {
    if (this.showOnInit) {
      this.startMessages();
    }
  }

  startMessages() {
    this.showMotivationalMessages = true;
    this.showNextMessage();
  }

  showNextMessage() {
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.motivationalMessages.length;
    this.currentMessage = this.motivationalMessages[this.currentMessageIndex];
    this.progressWidth = 100;
    this.startTime = Date.now();

    // Programar próximo cambio de mensaje
    this.messageTimeout = setTimeout(() => {
      this.showNextMessage();
    }, this.messageDuration);

    // Iniciar animación de progreso
    this.startProgressAnimation();
  }

  startProgressAnimation() {
    const animateProgress = () => {
      const elapsed = Date.now() - this.startTime;
      const progress = Math.max(0, 100 - (elapsed / this.messageDuration) * 100);
      
      this.progressWidth = progress;

      if (progress > 0) {
        this.progressTimeout = setTimeout(animateProgress, 50);
      }
    };

    animateProgress();
  }

  hideMessages() {
    this.showMotivationalMessages = false;
    this.clearTimeouts();
  }

  showMessages() {
    this.startMessages();
  }

  private clearTimeouts() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    if (this.progressTimeout) {
      clearTimeout(this.progressTimeout);
    }
  }

  ngOnDestroy() {
    this.clearTimeouts();
  }
}