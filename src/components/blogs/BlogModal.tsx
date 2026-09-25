import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { postBlogsApi, putBlogsApi } from "../../Api-Service/Apis";
import Input from "../Input";
import SingleImageUpload from "../products/SingleImageUpload";
import { useParams } from "react-router-dom";
import { InvalidateQueryFilters, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function BlogModal({ open, close, userId, editData }: any) {
    if (!open) return null;
    const [apiError, setApiError] = useState("");
    const [images, setImages] = useState<any[]>([]);
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const blogSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        subtitle: Yup.string().required("Subtitle is required"),
        description: Yup.string().required("Description is required"),
        content: Yup.string().required("Content is required"),
        author: Yup.string().required("Author is required"),
        meta_title: Yup.string().nullable(),
        meta_description: Yup.string().nullable(),
        canonical_tag: Yup.string().nullable(),
        robots_tag: Yup.string().nullable(),
        url_description: Yup.string().nullable(),
        url_slug: Yup.string().nullable(),
        og_tags: Yup.string().nullable(),
        twitter_tags: Yup.string().nullable(),
        image_src_tags: Yup.string().nullable(),
        schema: Yup.string().nullable(),
    });
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm({ resolver: yupResolver(blogSchema) });

    useEffect(() => {
        if (editData) {
            setValue("title", editData?.title || "");
            setValue("subtitle", editData?.subtitle || "");
            setValue("description", editData?.description || "");
            setValue("content", editData?.content || "");
            setValue("author", editData?.author || "");
            setValue("meta_title", editData?.meta_title || "");
            setValue("meta_description", editData?.meta_description || "");
            setValue("canonical_tag", editData?.canonical_tag || "");
            setValue("robots_tag", editData?.robots_tag || "");
            setValue("url_description", editData?.url_description || "");
            setValue("url_slug", editData?.url_slug || "");
            
            setValue("og_tags", editData?.og_tags && Object.keys(editData.og_tags).length ? JSON.stringify(editData.og_tags) : "");
            setValue("twitter_tags", editData?.twitter_tags && Object.keys(editData.twitter_tags).length ? JSON.stringify(editData.twitter_tags) : "");
            setValue("image_src_tags", editData?.image_src_tags && Object.keys(editData.image_src_tags).length ? JSON.stringify(editData.image_src_tags) : "");
            setValue("schema", editData?.schema && Object.keys(editData.schema).length ? JSON.stringify(editData.schema) : "");

            if (editData?.banner_url) {
                setImages([{ url: editData?.banner_url }]);
            }
        }
    }, [editData, setValue]);

    const onSubmit = async (data: any) => {
        delete data?.banner_url;
        try {
            setApiError("");
            let parsed_og_tags = {};
            let parsed_twitter_tags = {};
            let parsed_image_src_tags = {};
            let parsed_schema = {};
            try { parsed_og_tags = data.og_tags ? JSON.parse(data.og_tags) : {}; } catch (e) {}
            try { parsed_twitter_tags = data.twitter_tags ? JSON.parse(data.twitter_tags) : {}; } catch (e) {}
            try { parsed_image_src_tags = data.image_src_tags ? JSON.parse(data.image_src_tags) : {}; } catch (e) {}
            try { parsed_schema = data.schema ? JSON.parse(data.schema) : {}; } catch (e) {}

            const payload = {
                ...data,
                og_tags: parsed_og_tags,
                twitter_tags: parsed_twitter_tags,
                image_src_tags: parsed_image_src_tags,
                schema: parsed_schema,
                banner_url: images[0]?.url || "",
                vendor: id,
                user: userId,
                likes: 0,
            };
            if (editData) {
                const updateApi = await putBlogsApi(`${editData?.id}/`, {
                    ...payload,
                    updated_by: `Vendor${id}`,
                });
                if (updateApi) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            } else {
                const updateApi = await postBlogsApi('', {
                    ...payload,
                    created_by: `Vendor${id}`,
                });
                if (updateApi) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            }
        } catch (err: any) {
            setApiError(err?.response?.data?.message || "Failed to create blog. Please try again.");
        }
    };


    return (
        <>
            <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[96vh] overflow-y-auto shadow-xl"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {editData ? "Edit Blog" : "Add New Blog"}
                        </h3>
                        <button type="button" onClick={() => close()} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Details Section */}
                        <div className="space-y-5">
                            <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#f58220] rounded-full"></span>
                                Basic Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Input label='Title' {...register("title")} className="input w-full" />
                                    <p className="text-red-500 text-xs mt-1">{errors.title?.message}</p>
                                </div>
                                <div>
                                    <Input label='Subtitle' {...register("subtitle")} className="input w-full" />
                                    <p className="text-red-500 text-xs mt-1">{errors.subtitle?.message}</p>
                                </div>
                                <div>
                                    <Input label='Author' {...register("author")} className="input w-full" />
                                    <p className="text-red-500 text-xs mt-1">{errors.author?.message}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Banner Image
                                    </label>
                                    <SingleImageUpload images={images} onChange={setImages} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea {...register("description")}
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border"
                                />
                                <p className="text-red-500 text-xs mt-1">{errors.description?.message}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content
                                </label>
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="bg-white rounded-md">
                                            <ReactQuill
                                                theme="snow"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                className="h-48 mb-12"
                                            />
                                        </div>
                                    )}
                                />
                                <p className="text-red-500 text-xs mt-1">{errors.content?.message}</p>
                            </div>
                        </div>

                        {/* SEO and Meta Data Fields */}
                        <div className="space-y-5 pt-2">
                            <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-[#f58220] rounded-full"></span>
                                SEO & Meta Tags
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <Input label='Meta Title' {...register("meta_title")} className="input w-full bg-white" />
                                </div>
                                <div>
                                    <Input label='URL Slug' {...register("url_slug")} className="input w-full bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                    <textarea {...register("meta_description")} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Description</label>
                                    <textarea {...register("url_description")} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border bg-white" />
                                </div>
                                <div>
                                    <Input label='Canonical Tag' {...register("canonical_tag")} className="input w-full bg-white" />
                                </div>
                                <div>
                                    <Input label='Robots Tag' {...register("robots_tag")} className="input w-full bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Advanced JSON Tags */}
                        <div className="space-y-5 pt-2">
                            <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-gray-400 rounded-full"></span>
                                Advanced Meta Tags (JSON)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Tags</label>
                                    <textarea {...register("og_tags")} rows={3} placeholder='{"property": "content"}' className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border font-mono text-xs bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Tags</label>
                                    <textarea {...register("twitter_tags")} rows={3} placeholder='{"property": "content"}' className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border font-mono text-xs bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Src Tags</label>
                                    <textarea {...register("image_src_tags")} rows={3} placeholder='{"property": "content"}' className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border font-mono text-xs bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Schema</label>
                                    <textarea {...register("schema")} rows={3} placeholder='{"property": "content"}' className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f58220] focus:ring-[#f58220] sm:text-sm p-2.5 border font-mono text-xs bg-white" />
                                </div>
                            </div>
                        </div>

                        {apiError && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {apiError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
                                onClick={() => close()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-[#f58220] text-white rounded-md hover:bg-[#e0751a] font-medium transition-colors shadow-sm"
                            >
                                {editData ? "Update Blog" : "Publish Blog"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default BlogModal;