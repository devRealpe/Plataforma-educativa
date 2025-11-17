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
    "No tengas miedo de equivocarte, recuerda que los errores son parte del camino para llegar al éxito.",
    "Cada error es una oportunidad para aprender algo nuevo.",
    "Cometer errores te acerca un paso más a tu meta.",
    "El éxito nace de la perseverancia y el aprendizaje constante.",
    "Aprender es progreso, incluso cuando tropiezas.",
    "Los errores no definen quién eres, sino cómo creces.",
    "Si no cometes errores, es porque no estás intentándolo lo suficiente.",
    "Cada desafío superado te hace más fuerte y sabio.",
    "Valora tus errores, porque muestran que estás creciendo.",
    "La clave del aprendizaje está en seguir intentándolo sin rendirse.",
    "Las notas no definen quién eres, tu esfuerzo y dedicación sí lo hacen.",
    "El verdadero aprendizaje viene del proceso, no solo del resultado final.",
    "Cada pequeño progreso cuenta, celebra tus avances por pequeños que sean.",
    "Tu valor como estudiante va más allá de cualquier calificación.",
    "El conocimiento que construyes hoy será tu fortaleza del mañana.",
    "Confía en tu capacidad de aprender y mejorar cada día.",
    "Los grandes aprendizajes a menudo vienen de los intentos fallidos.",
    "Tu curiosidad y ganas de aprender son tus mejores herramientas.",
    "Cada pregunta que te haces es un paso hacia el entendimiento.",
    "El crecimiento personal es tu mayor logro académico."
  ];

  currentMessageIndex = 0;
  currentMessage = '';
  progressWidth = 100;
  private messageInterval: any;
  private progressInterval: any;
  showMotivationalMessages = true;

  ngOnInit() {
    if (this.showOnInit) {
      this.startMessages();
    }
  }

  startMessages() {
    this.showMotivationalMessages = true;
    this.showNextMessage();
    
    // Cambiar mensaje cada 10 segundos
    this.messageInterval = setInterval(() => {
      this.showNextMessage();
    }, 10000);

    // Actualizar barra de progreso cada 100ms
    this.progressInterval = setInterval(() => {
      this.updateProgress();
    }, 100);
  }

  showNextMessage() {
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.motivationalMessages.length;
    this.currentMessage = this.motivationalMessages[this.currentMessageIndex];
    this.progressWidth = 100;
  }

  updateProgress() {
    if (this.progressWidth > 0) {
      this.progressWidth -= 0.1; // Disminuye 0.1% cada 100ms (10 segundos total)
    }
  }

  hideMessages() {
    this.showMotivationalMessages = false;
    this.clearIntervals();
  }

  showMessages() {
    this.startMessages();
  }

  private clearIntervals() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  ngOnDestroy() {
    this.clearIntervals();
  }
}