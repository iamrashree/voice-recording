import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-voice-record',
  templateUrl: './voice-record.component.html',
  styleUrls: ['./voice-record.component.scss']
})
export class VoiceRecordComponent implements OnInit {

  public recordOwnVoiceStarted = false;
  public playRecording = false;
  public audioCtx = new AudioContext();
  public blob: any;
  public source: any;
  public audio: any;
  public record: any;

  @ViewChild('recordedAudio')
  public recordedAudio!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  start() {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioChunks: any[] = [];
      this.record = new MediaRecorder(stream);

      this.record.ondataavailable = async (e: any) => {
        audioChunks.push(e.data);
        console.log('audioChunks', audioChunks);
        if (this.record.state == "inactive") {
          this.blob = new Blob(audioChunks, { type: 'audio/x-mpeg-3' });
          this.recordedAudio.nativeElement.src = URL.createObjectURL(this.blob);
        }
      }
      this.record.start();
    })
    .catch(e => console.log(e));
  }

  stop() {
    this.record.stop();
  }

  public async getData() {
    const offlineCtx = new OfflineAudioContext(2,44100*40,44100);
    this.source = this.audioCtx.createBufferSource();

    const audioData = await this.blob.arrayBuffer();

    offlineCtx.decodeAudioData(audioData, (buffer) => {
      this.source.buffer = buffer;
      this.source.playbackRate.value = 1;
      this.source.connect(this.audioCtx.destination);
    });
  }

  recordVoice() {
    if(!this.recordOwnVoiceStarted) {
      this.start();
    } else {
      this.stop();
    }
    this.recordOwnVoiceStarted = !this.recordOwnVoiceStarted;
  }

  play() {
    if (!this.playRecording) {
      this.getData();
      this.source.start(0);
      
    } else {
      this.source.stop(0);
    }
    this.playRecording = !this.playRecording;
  }

  // pause() {
  //   this.source.stop(0);
  // }
}
