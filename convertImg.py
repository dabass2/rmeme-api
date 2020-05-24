from PIL import Image
import uuid
import sys
import os

def toJpg(image):
    im = Image.open(image)
    if im.mode != "RGB":
        im = im.convert('RGB')
    name = uuid.uuid4().hex
    print(name)
    sys.stdout.flush()
    im.save("./images/memes/{}.jpg".format(name))

def main():
    image = sys.argv[1]
    toJpg(image)
    os.remove(image)

main()