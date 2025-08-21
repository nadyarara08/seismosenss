import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  AlertController,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, logOutOutline, peopleOutline, codeSlashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton
  ]
})
export class SettingsPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  developers = [
    {
      name: 'Tim SeismoSens Indonesia',
      role: 'Lead Developer & Project Manager',
      description: 'Pengembang utama aplikasi SeismoSens untuk monitoring gempa bumi',
      avatar: '👨‍💻'
    },
    {
      name: 'Indonesia Inventors Day 2025',
      role: 'Event Organizer',
      description: 'Penyelenggara kompetisi inovasi teknologi Indonesia',
      avatar: '🏆'
    },
    {
      name: 'Komunitas IoT Indonesia',
      role: 'Technical Advisor',
      description: 'Konsultan teknis untuk pengembangan sensor seismik',
      avatar: '🔧'
    },
    {
      name: 'Universitas Teknologi Indonesia',
      role: 'Research Partner',
      description: 'Mitra penelitian untuk validasi algoritma deteksi gempa',
      avatar: '🎓'
    }
  ];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({ chevronForward, logOutOutline, peopleOutline, codeSlashOutline });
  }

  ngOnInit() {
  }

  async showSetting(settingName: string) {
    // Handle special cases
    if (settingName.toLowerCase().includes('about') || settingName.toLowerCase().includes('tentang')) {
      await this.showDeveloperList();
      return;
    }

    const alert = await this.alertController.create({
      header: settingName,
      message: `Membuka ${settingName}...\n\nFitur akan tersedia di versi lengkap aplikasi.\n\nDemo mode - SeismoSens Indonesia Inventors Day 2025`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async showDeveloperList() {
    const alert = await this.alertController.create({
      header: '👥 Tim Pengembang SeismoSens',
      message: this.developers.map(dev => 
        `${dev.avatar} **${dev.name}**\n${dev.role}\n${dev.description}\n`
      ).join('\n'),
      buttons: [
        {
          text: 'Tutup',
          role: 'cancel'
        },
        {
          text: '🌟 Terima Kasih!',
          handler: async () => {
            const toast = await this.toastController.create({
              message: '🙏 Terima kasih telah menggunakan SeismoSens!',
              duration: 2000,
              position: 'bottom',
              color: 'success'
            });
            await toast.present();
          }
        }
      ],
      cssClass: 'developer-alert'
    });

    await alert.present();
  }

  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(500);
    }
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(500);
    }
  }

  async scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element && this.content) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Keluar dari Akun',
      message: 'Yakin ingin keluar dari akun SeismoSens?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Keluar',
          role: 'confirm',
          handler: async () => {
            const toast = await this.toastController.create({
              message: '✅ Berhasil logout! Terima kasih telah menggunakan SeismoSens.',
              duration: 3000,
              position: 'bottom',
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }
}
