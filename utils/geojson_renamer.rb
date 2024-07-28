geojson_folder = "bicycle-trips"
filenames = Dir.entries(geojson_folder)[2..]

filenames.each_with_index { |filename, i| File.rename("#{geojson_folder}/#{filename}", "#{geojson_folder}/bicycle-trip-#{i}.geojson")}