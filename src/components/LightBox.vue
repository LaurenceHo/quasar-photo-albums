<template>
  <div>
    <transition name="lightbox-fade">
      <div @mousedown.stop="hide" @touchdown.stop="hide" class="lightbox" v-if="visible">
        <div @mousedown.stop="hide" @touchdown.stop="hide" class="lightbox-close">&times;</div>
        <div @mousedown.stop.prevent="prev" @touchdown.stop.prevent="prev" class="lightbox-arrow lightbox-arrow-left">
          <transition name="lightbox-fade">
            <div class="lightbox-arrow-left-icon" v-show="has_prev() && controlsVisible">
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" fill="rgba(20, 20, 20, 0.4)" r="12"></circle>
                <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z" fill="white"></path>
                <path d="M0-.5h24v24H0z" fill="none"></path>
              </svg>
            </div>
          </transition>
        </div>
        <div @mousedown.stop.prevent="next" @touchdown.stop.prevent="next" class="lightbox-arrow lightbox-arrow-right">
          <transition name="lightbox-fade">
            <div class="lightbox-arrow-right-icon" v-show="has_next() && controlsVisible">
              <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" fill="rgba(20, 20, 20, 0.4)" r="12"></circle>
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" fill="white"></path>
                <path d="M0-.25h24v24H0z" fill="none"></path>
              </svg>
            </div>
          </transition>
        </div>
        <transition name="lightbox-fade">
          <div
            @mousedown.stop
            @touchdown.stop
            class="lightbox-caption"
            v-show="controlsVisible && filteredImages[index].alt"
          >
            <span unselectable="on">{{ filteredImages[index].alt }}</span>
          </div>
        </transition>
        <div @mousedown.stop="hide" @touchdown.stop="hide" class="lightbox-main">
          <div @mousedown.stop @touchdown.stop class="lightbox-image-container">
            <transition :name="slideTransitionName" mode="out-in">
              <div
                :key="index"
                :style="{ backgroundImage: 'url(' + directory + filteredImages[index].name + ')' }"
                class="lightbox-image"
              ></div>
            </transition>
          </div>
        </div>
        <!-- total images -->
        <div class="lightbox-total" v-if="images.length > 0">{{ index + 1 }}/{{ images.length }}</div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { LightBoxImage } from 'components/models';

export default defineComponent({
  name: 'LightBox',

  props: {
    // Control whether to display lightbox or not (from parent component)
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
    // images = [{ name:'image1.jpg', alt:'Redwoods', filter:'nature' }, ...]
    images: {
      type: Array,
      required: true,
      default: (): LightBoxImage[] => [],
    },
    imageName: String,

    // Used to display a subset of photos. If used, images array must contain a property
    // titled 'filter' which contains the desired filter string
    filter: {
      type: String,
      default: 'all',
    },
    // Used if images are located in a separate folder (e.g. '/images/')
    directory: {
      type: String,
      default: '',
    },
    // Used to set the duration in millisecond of key/mouse inactivity before caption
    // and arrows disappear
    timeoutDuration: {
      type: Number,
      default: 3000,
    },
  },

  data() {
    return {
      controlsVisible: true, // Lightbox controls (arrows, caption, close button)
      index: 0, // Index indicates which photo to display. Default to 1st photo
      timer: 0, // Timer to show/hide lightbox controls
      slideTransitionName: 'lightbox-slide-next', //Controls animation's transition direction (next or prev)
    };
  },

  mounted() {
    window.addEventListener('keydown', this.keyEventListener);
    window.addEventListener('mousemove', this.mouseEventListener);
    window.addEventListener('touchmove', this.mouseEventListener);
    window.addEventListener('mouseup', this.mouseEventListener);
  },

  unmounted() {
    window.removeEventListener('keydown', this.keyEventListener);
    window.removeEventListener('mousemove', this.mouseEventListener);
    window.removeEventListener('touchmove', this.mouseEventListener);
    window.removeEventListener('mouseup', this.mouseEventListener);
  },

  computed: {
    filteredImages(): LightBoxImage[] {
      const imageList = this.images as LightBoxImage[];
      if (this.filter === 'all' || !this.filter.length) {
        return imageList;
      }
      return imageList.filter((image: LightBoxImage) => image.filter === this.filter);
    },
  },

  watch: {
    imageName(value: string) {
      if (value) {
        this.controlsVisible = true;
        // Find the index of the image passed to Lightbox
        this.index = this.filteredImages.findIndex((image: LightBoxImage) => {
          return image.name === value;
        });
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => {
          this.controlsVisible = false;
        }, this.timeoutDuration);
        this.preloadNextImage();
      }
    },
  },

  emits: ['hideLightBox'],
  methods: {
    has_next() {
      return this.index + 1 < this.filteredImages.length;
    },
    has_prev() {
      return this.index - 1 >= 0;
    },
    prev() {
      if (this.has_prev()) {
        this.slideTransitionName = 'lightbox-slide-prev';
        this.index -= 1;
      }
    },
    next() {
      if (this.has_next()) {
        this.slideTransitionName = 'lightbox-slide-next';
        this.index += 1;
        this.preloadNextImage();
      }
    },
    keyEventListener(e: any) {
      if (this.visible) {
        this.controlsVisible = true;
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => {
          this.controlsVisible = false;
        }, this.timeoutDuration);
        switch (e.key) {
          case 'ArrowRight':
            this.next();
            break;
          case 'ArrowLeft':
            this.prev();
            break;
          case 'ArrowDown':
          case 'ArrowUp':
          case ' ':
            e.preventDefault();
            break;
          case 'Escape':
            this.hide();
            break;
        }
      }
    },
    mouseEventListener(e: any) {
      if (this.visible) {
        this.controlsVisible = true;
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => {
          this.controlsVisible = false;
        }, this.timeoutDuration);
      }
    },
    preloadNextImage() {
      if (this.has_next()) {
        try {
          let _img = new Image();
          _img.src = this.directory + this.filteredImages[this.index + 1].name;
        } catch (error) {
          // eslint-disable-next-line
          console.error(error);
        }
      }
    },
    hide() {
      this.index = 0;
      clearTimeout(this.timer);
      this.$emit('hideLightBox');
    },
  },
});
</script>

<style scoped>
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  width: 100%;
  height: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
  color: rgba(255, 255, 255, 0.8);
}
.lightbox-close {
  position: fixed;
  z-index: 2010;
  right: 0;
  top: 0;
  padding: 1rem;
  font-size: 1.7rem;
  cursor: pointer;
  width: 4rem;
  height: 4rem;
  color: white;
}
.lightbox-main {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  width: 80%;
  height: 80%;
}
.lightbox-arrow {
  padding: 0 2rem;
  cursor: pointer;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  height: 100%;
  width: 2rem;
  z-index: 100;
}
.lightbox-arrow-right {
  right: 0;
}
.lightbox-arrow-left {
  left: 0;
}
.lightbox-image-container {
  -webkit-box-flex: 1;
  width: 20%;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}
.lightbox-image {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
}
.lightbox-caption {
  position: absolute;
  bottom: 15px;
  width: 100%;
  z-index: 100;
  text-align: center;
  text-shadow: 1px 1px 3px rgb(26, 26, 26);
}
.lightbox-caption span {
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 2px 10px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.lightbox-total {
  position: absolute;
  top: 5%;
  width: 100%;
  text-align: center;
}
.lightbox-slide-next-enter-active,
.lightbox-slide-next-leave-active,
.lightbox-slide-prev-enter-active,
.lightbox-slide-prev-leave-active {
  transition: all 0.4s ease;
}
.lightbox-slide-next-enter {
  -webkit-transform: translateX(100px);
  -ms-transform: translateX(100px);
  transform: translateX(100px);
  opacity: 0;
}
.lightbox-slide-next-leave-to {
  -webkit-transform: translateX(-100px);
  -ms-transform: translateX(-100px);
  transform: translateX(-100px);
  opacity: 0;
}
.lightbox-slide-prev-enter {
  -webkit-transform: translateX(-100px);
  -ms-transform: translateX(-100px);
  transform: translateX(-100px);
  opacity: 0;
}
.lightbox-slide-prev-leave-to {
  -webkit-transform: translateX(100px);
  -ms-transform: translateX(100px);
  transform: translateX(100px);
  opacity: 0;
}
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: all 0.4s ease;
}
.lightbox-fade-enter,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
