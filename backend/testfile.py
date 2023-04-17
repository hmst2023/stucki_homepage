from PIL import Image
from datetime import datetime
f = Image.open('IMG_7373.JPG', 'r')
exif = f.getexif()
print(type(exif))
print(datetime.strptime(exif[306], '%Y:%m:%d %H:%M:%S'))

image_wo_exif = Image.new(f.mode, f.size)
image_wo_exif.putdata(f.getdata())
image_wo_exif.save('newfile.jpg')
