import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { createReadStream } from 'node:fs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { STATUS_CODES } from 'http';
import { CurrentUser } from '@src/auth/decorators/current-user.decorator';
import { RecipesService } from '@src/recipes/services/recipes.service';
import { UpsertRecipeDto } from '@src/recipes/dtos/upsert-recipe.dto';
import { SearchRecipesDto } from '@src/recipes/dtos/search-recipes.dto';
import { Public } from '@src/auth/decorators/public.decorator';
import { RECIPE_IMAGE_MAX_SIZE_BYTES } from '@src/recipes/constants/recipe-image.constants';

@ApiTags('Recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria ou edita uma receita',
    description:
      'Mesmo endpoint para criação e edição: omita "id" (e os "id" dos itens de ingredients/instructions/visualSteps/chefTips) para criar; envie o "id" da receita para editá-la — itens com "id" são atualizados, itens sem "id" são criados, e itens salvos que não forem enviados são removidos. Só o autor da receita pode editá-la.',
  })
  @ApiBody({ type: UpsertRecipeDto })
  @ApiCreatedResponse({ description: STATUS_CODES[HttpStatus.CREATED] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  async upsert(
    @CurrentUser() user: { userId: string },
    @Body() upsertRecipeDto: UpsertRecipeDto,
  ) {
    return this.recipesService.upsert(user.userId, upsertRecipeDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Busca receitas por título/categoria, com paginação',
  })
  @ApiOkResponse({ description: STATUS_CODES[HttpStatus.OK] })
  async search(@Query() searchRecipesDto: SearchRecipesDto) {
    return this.recipesService.search(searchRecipesDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Busca uma receita pelo id' })
  @ApiOkResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.recipesService.findOne(id);
  }

  @Post(':id/image')
  @ApiOperation({
    summary: 'Envia (ou substitui) a imagem principal da receita',
    description:
      'Aceita multipart/form-data com o campo "image" (JPEG, PNG ou WEBP, até 5MB). Apenas o autor da receita pode enviar.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({ description: STATUS_CODES[HttpStatus.OK] })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: RECIPE_IMAGE_MAX_SIZE_BYTES },
    }),
  )
  async uploadImage(
    @CurrentUser() user: { userId: string },
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem enviada');
    }

    return this.recipesService.attachImage(user.userId, id, file);
  }

  @Get(':id/image')
  @Public()
  @ApiOperation({ summary: 'Retorna a imagem principal da receita' })
  @ApiNotFoundResponse({ description: STATUS_CODES[HttpStatus.NOT_FOUND] })
  async getImage(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StreamableFile> {
    const { path, mimeType } = await this.recipesService.getImageFile(id);

    return new StreamableFile(createReadStream(path), { type: mimeType });
  }
}
