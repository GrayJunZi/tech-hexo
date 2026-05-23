# hexo-theme-Tech

Tech 是一个风格简明、动效丰富的 Hexo 主题，在[3-hexo](https://github.com/yelog/hexo-theme-3-hexo)的基础上完全重构了布局和样式，移除了评论打赏等功能。

![视觉效果预览](source/img/review.jpg)

**在线体验**：https://sanqi-normal.github.io/


## 特点
- **机能风**
- **体验丝滑流畅**
- **包含多种音效**
- **内置可视化音乐播放器**
- **文章内图片可做封面图预览**
- **样式与布局解耦**
- **易于扩展**


## 安装

```bash
git clone https://github.com/Sanqi-normal/tech-hexo.git themes/tech-hexo
```

## 配置

修改 Hexo 根目录下的 `_config.yml`：

```yaml
theme: tech-hexo
```

## 主题配置相关

### 有关封面图

当文章内包含图片时，会首先使用第一张图片作为封面图；如果没有图片，则使用主分类对应的默认图

当新增一种分类时，要为这个分类在 `source/img/categories`  中添加[分类名].jpg作为此分类的默认图，否则会进一步回退到纯色背景。

### 有关图标

想要为导航栏添加图标，需在`source/img/navigation`下添加同名svg图片
社交链接图标同理，在`source/img/socail`下添加同名svg图片

### 有关音乐

在`source/music`下添加任意数量的mp3格式音频，会自动读取列表并顺次播放

### 有关音效

你可以通过用自己的音频替换掉`source/audio`下音频来替换点击等音效，注意保持命名一致


## 致谢

作者yelog的[3-hexo](https://github.com/yelog/hexo-theme-3-hexo)主题